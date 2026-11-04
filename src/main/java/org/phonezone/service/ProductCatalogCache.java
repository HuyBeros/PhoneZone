package org.phonezone.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Status;
import jakarta.transaction.Synchronization;
import jakarta.transaction.TransactionSynchronizationRegistry;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

/** Optional, fail-open cache of public JSON responses, never managed JPA entities. */
@ApplicationScoped
public class ProductCatalogCache {
    private static final Logger LOG = Logger.getLogger(ProductCatalogCache.class);
    private static final Object INVALIDATION_RESOURCE = new Object();

    private final ValueCommands<String, String> values;
    private final ObjectMapper mapper;
    private final TransactionSynchronizationRegistry transactions;
    private final boolean enabled;
    private final String namespace;
    private final long ttlSeconds;
    private final long retryDelayMillis;
    private final AtomicLong retryAfter = new AtomicLong();
    private final AtomicLong invalidationsRequested = new AtomicLong();
    private final AtomicLong invalidationsCompleted = new AtomicLong();

    @Inject
    public ProductCatalogCache(RedisDataSource redis, ObjectMapper mapper,
            TransactionSynchronizationRegistry transactions,
            @ConfigProperty(name = "phonezone.catalog-cache.enabled", defaultValue = "true") boolean enabled,
            @ConfigProperty(name = "phonezone.catalog-cache.namespace", defaultValue = "phonezone:catalog:v1") String namespace,
            @ConfigProperty(name = "phonezone.catalog-cache.ttl", defaultValue = "60s") Duration ttl,
            @ConfigProperty(name = "phonezone.catalog-cache.retry-delay", defaultValue = "5s") Duration retryDelay) {
        this(redis.value(String.class), mapper, transactions, enabled, namespace, ttl, retryDelay);
    }

    ProductCatalogCache(ValueCommands<String, String> values, ObjectMapper mapper,
            TransactionSynchronizationRegistry transactions, boolean enabled, String namespace,
            Duration ttl, Duration retryDelay) {
        if (ttl.isNegative() || ttl.isZero() || retryDelay.isNegative() || namespace.isBlank()) {
            throw new IllegalArgumentException("Catalog cache requires a namespace, positive TTL and nonnegative retry delay");
        }
        this.values = values;
        this.mapper = mapper;
        this.transactions = transactions;
        this.enabled = enabled;
        this.namespace = namespace;
        this.ttlSeconds = Math.max(1, ttl.toSeconds());
        this.retryDelayMillis = retryDelay.toMillis();
    }

    public JsonNode getOrLoad(String region, Object[] arguments, Supplier<JsonNode> loader) {
        // Transactional callers must neither read stale cache nor publish uncommitted data.
        if (!enabled || transactions.getTransactionKey() != null || System.currentTimeMillis() < retryAfter.get()) {
            return loader.get();
        }
        String key = null;
        try {
            flushInvalidations();
            String generation = values.get(generationKey());
            if (generation == null) {
                values.setnx(generationKey(), UUID.randomUUID().toString());
                generation = values.get(generationKey());
            }
            if (generation == null) throw new IllegalStateException("Missing catalog cache generation");
            key = namespace + ":" + generation + ":" + region + ":" + digest(arguments);
            String cached = values.get(key);
            if (cached != null) {
                try {
                    JsonNode json = mapper.readTree(cached);
                    if (json != null && !json.isNull()) return json;
                } catch (JsonProcessingException invalidJson) {
                    LOG.debug("Ignoring malformed product cache entry");
                }
            }
        } catch (RuntimeException unavailable) {
            cacheUnavailable(unavailable);
            key = null;
        }

        // Keep database and serialization failures outside Redis recovery handling.
        JsonNode result = loader.get();
        if (key != null && result != null && !result.isNull()) {
            try {
                // A concurrent commit rotates the generation; an older reader can only fill its old key.
                values.setex(key, ttlSeconds, result.toString());
            } catch (RuntimeException unavailable) {
                cacheUnavailable(unavailable);
            }
        }
        return result;
    }

    public void invalidateAfterCommit() {
        if (!enabled) return;
        if (transactions.getTransactionKey() == null) {
            invalidateNow();
        } else if (transactions.getResource(INVALIDATION_RESOURCE) == null) {
            transactions.putResource(INVALIDATION_RESOURCE, Boolean.TRUE);
            transactions.registerInterposedSynchronization(new Synchronization() {
                @Override public void beforeCompletion() { }
                @Override public void afterCompletion(int status) {
                    if (status == Status.STATUS_COMMITTED) invalidateNow();
                }
            });
        }
    }

    private void invalidateNow() {
        invalidationsRequested.incrementAndGet();
        // Retain pending invalidation while offline; replay before accepting any cache hit.
        if (System.currentTimeMillis() < retryAfter.get()) return;
        try {
            flushInvalidations();
        } catch (RuntimeException unavailable) {
            cacheUnavailable(unavailable);
        }
    }

    private void flushInvalidations() {
        long requested = invalidationsRequested.get();
        if (requested <= invalidationsCompleted.get()) return;
        values.set(generationKey(), UUID.randomUUID().toString());
        invalidationsCompleted.accumulateAndGet(requested, Math::max);
    }

    private String generationKey() { return namespace + ":generation"; }

    private String digest(Object[] arguments) {
        try {
            byte[] bytes = mapper.valueToTree(arguments).toString().getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private void cacheUnavailable(RuntimeException failure) {
        long now = System.currentTimeMillis();
        long previous = retryAfter.getAndSet(now + retryDelayMillis);
        if (previous <= now) {
            LOG.warnf("Product cache unavailable (%s); using PostgreSQL, retrying in %d ms",
                    failure.getClass().getSimpleName(), retryDelayMillis);
        }
    }
}
