package org.phonezone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.transaction.Status;
import jakarta.transaction.Synchronization;
import jakarta.transaction.TransactionSynchronizationRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class ProductCatalogCacheTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, String> entries = new HashMap<>();
    private final TestTransactions transactions = new TestTransactions();
    private final AtomicInteger loads = new AtomicInteger();
    private boolean offline, writesFail;
    private int commands;
    private ProductCatalogCache cache;

    @BeforeEach void setup() { cache = cache(true, Duration.ZERO); }

    @SuppressWarnings("unchecked")
    private ProductCatalogCache cache(boolean enabled, Duration retryDelay) {
        ValueCommands<String, String> values = (ValueCommands<String, String>) Proxy.newProxyInstance(
                ValueCommands.class.getClassLoader(), new Class<?>[]{ValueCommands.class}, (proxy, method, args) -> {
                    commands++;
                    if (offline) throw new IllegalStateException("test Redis unavailable");
                    String key = (String) args[0];
                    return switch (method.getName()) {
                        case "get" -> entries.get(key);
                        case "setnx" -> entries.putIfAbsent(key, (String) args[1]) == null;
                        case "set" -> { entries.put(key, (String) args[1]); yield null; }
                        case "setex" -> {
                            if (writesFail) throw new IllegalStateException("test Redis write failure");
                            entries.put(key, (String) args[2]); yield null;
                        }
                        default -> throw new UnsupportedOperationException(method.getName());
                    };
                });
        return new ProductCatalogCache(values, mapper, transactions, enabled, "test:catalog",
                Duration.ofSeconds(60), retryDelay);
    }

    private JsonNode load() { return mapper.createObjectNode().put("load", loads.incrementAndGet()); }
    private JsonNode read() { return cache.getOrLoad("detail", new Object[]{1L}, this::load); }

    @Test void repeatedReadsUseCacheAndReturnIndependentJsonSnapshots() {
        JsonNode first = read();
        ((com.fasterxml.jackson.databind.node.ObjectNode) first).put("load", 999);
        assertEquals(1, read().get("load").asInt());
        assertEquals(1, loads.get());
    }

    @Test void paginationFiltersAndEndpointRegionsCannotShareEntries() {
        for (Object[] args : List.of(new Object[]{null, 0, 10}, new Object[]{"Apple", 0, 10},
                new Object[]{"Apple", 1, 10}, new Object[]{"Apple", 1, 20})) {
            cache.getOrLoad("list", args, this::load);
            cache.getOrLoad("list", args, this::load);
        }
        cache.getOrLoad("search", new Object[]{"Apple", 1, 20}, this::load);
        assertEquals(5, loads.get());
    }

    @Test void missingProductsAndDatabaseFailuresAreNotCached() {
        for (int i = 0; i < 2; i++) {
            assertNull(cache.getOrLoad("detail", new Object[]{1}, () -> { loads.incrementAndGet(); return null; }));
        }
        IllegalArgumentException failure = new IllegalArgumentException("database error");
        assertSame(failure, assertThrows(IllegalArgumentException.class,
                () -> cache.getOrLoad("detail", new Object[]{1}, () -> { throw failure; })));
        assertEquals(2, loads.get());
        assertEquals(1, entries.size()); // generation metadata only
    }

    @Test void corruptCachedJsonIsReplacedFromTheDatabase() {
        read();
        String key = entries.keySet().stream().filter(k -> k.contains(":detail:")).findFirst().orElseThrow();
        entries.put(key, "{broken-json");
        assertEquals(2, read().get("load").asInt());
        assertEquals(2, read().get("load").asInt());
        assertEquals(2, loads.get());
    }

    @Test void readFailureFallsBackAndTemporarilyStopsRetryingRedis() {
        cache = cache(true, Duration.ofHours(1));
        offline = true;
        assertEquals(1, read().get("load").asInt());
        int attempts = commands;
        assertEquals(2, read().get("load").asInt());
        assertEquals(attempts, commands);
    }

    @Test void writeFailureDoesNotFailSuccessfulDatabaseReads() {
        writesFail = true;
        assertEquals(1, read().get("load").asInt());
        assertEquals(2, read().get("load").asInt());
    }

    @Test void invalidationThatFailsOfflineIsReplayedBeforeRecoveryReads() {
        assertEquals(1, read().get("load").asInt());
        offline = true;
        assertDoesNotThrow(cache::invalidateAfterCommit);
        offline = false;
        assertEquals(2, read().get("load").asInt());
        assertEquals(2, read().get("load").asInt());
    }

    @Test void anOlderReaderCannotRefillTheNewGenerationAfterAMutation() {
        cache.getOrLoad("detail", new Object[]{1L}, () -> {
            cache.invalidateAfterCommit();
            return load();
        });
        assertEquals(2, read().get("load").asInt());
    }

    @Test void transactionCommitInvalidatesOnceAndRollbackPreservesExistingCache() {
        read();
        String before = entries.get("test:catalog:generation");
        transactions.begin();
        cache.invalidateAfterCommit();
        cache.invalidateAfterCommit();
        assertEquals(1, transactions.synchronizations.size());
        assertEquals(before, entries.get("test:catalog:generation"));
        assertEquals(2, read().get("load").asInt()); // no cache inside a transaction
        transactions.finish(Status.STATUS_ROLLEDBACK);
        assertEquals(before, entries.get("test:catalog:generation"));
        assertEquals(1, read().get("load").asInt());
        transactions.begin();
        cache.invalidateAfterCommit();
        transactions.finish(Status.STATUS_COMMITTED);
        assertNotEquals(before, entries.get("test:catalog:generation"));
        assertEquals(3, read().get("load").asInt());
    }

    @Test void disablingCacheDoesNotContactRedis() {
        cache = cache(false, Duration.ZERO);
        read(); read(); cache.invalidateAfterCommit();
        assertEquals(2, loads.get());
        assertEquals(0, commands);
    }

    private static final class TestTransactions implements TransactionSynchronizationRegistry {
        private final Map<Object, Object> resources = new HashMap<>();
        private final List<Synchronization> synchronizations = new ArrayList<>();
        private int status = Status.STATUS_NO_TRANSACTION;
        void begin() { status = Status.STATUS_ACTIVE; resources.clear(); synchronizations.clear(); }
        void finish(int completion) {
            status = Status.STATUS_NO_TRANSACTION;
            synchronizations.forEach(s -> s.afterCompletion(completion));
        }
        @Override public Object getTransactionKey() { return status == Status.STATUS_NO_TRANSACTION ? null : this; }
        @Override public void putResource(Object key, Object value) { resources.put(key, value); }
        @Override public Object getResource(Object key) { return resources.get(key); }
        @Override public void registerInterposedSynchronization(Synchronization sync) { synchronizations.add(sync); }
        @Override public int getTransactionStatus() { return status; }
        @Override public void setRollbackOnly() { status = Status.STATUS_MARKED_ROLLBACK; }
        @Override public boolean getRollbackOnly() { return status == Status.STATUS_MARKED_ROLLBACK; }
    }
}
