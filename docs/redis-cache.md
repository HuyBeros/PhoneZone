# Redis product catalog cache

PhoneZone uses the Quarkus Redis client to cache public catalog responses as JSON.
PostgreSQL remains the source of truth for products, prices, stock, carts and orders.

## API contract

The following existing routes retain their response fields, status codes and validation:

| Route | Cached content | Key inputs |
| --- | --- | --- |
| `GET /api/products` | Product list and pagination metadata | brand, category, min/max price, sort, page, size, q |
| `GET /api/products/{id}` | Active product detail | product ID |
| `GET /api/products/search` | Active product search results | q, limit |
| `GET /api/products/brands` | Public brand list | none |

Admin endpoints are not cached. Hidden products never enter public catalog results.
Missing products and failed requests are not cached. Cache values are JSON snapshots;
no detached or managed Hibernate entities are restored from Redis.

## Run locally

Start the cache service defined in the existing compose file:

```powershell
docker compose up -d redis
docker compose exec redis redis-cli ping
```

The expected reply is `PONG`. The local compose service binds to `127.0.0.1:6379`,
has a 128 MB memory limit and evicts least recently used keys when full.
Redis data does not need persistent storage; it can be rebuilt from PostgreSQL.

Environment variables (also documented in `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URI; use the provider's secured URI for remote Redis |
| `CATALOG_CACHE_ENABLED` | `true` in dev, `false` in prod | Set `false` to bypass cache; `.env.example` explicitly disables it |
| `CATALOG_CACHE_NAMESPACE` | `phonezone:catalog:v1` | Unique prefix per environment/database |
| `CATALOG_CACHE_TTL` | `60s` | Absolute entry lifetime; reads do not extend it |

For example, `.env.example` uses `phonezone:catalog:dev:v1`. Do not share a namespace
between different databases. When deploying a response-schema change, use a new
namespace/version so an older JSON format cannot be reused.

## Consistency and failure handling

- Product create/update/delete/bulk delete, imports/import clear, order placement
  and stock restoration invalidate all four public catalog caches **after commit**.
  Rolled-back writes do not invalidate or publish uncommitted data.
- A shared Redis generation token is rotated on invalidation. Every read includes
  the generation in its key. An in-flight reader from an old generation cannot
  repopulate the new generation with an old response.
- Old generation entries expire naturally; the application does not scan/delete
  unrelated Redis keys or execute `FLUSHDB`/`FLUSHALL`.
- Redis reads/writes have a 300 ms blocking timeout. On failure, requests use
  PostgreSQL and pause Redis attempts for five seconds. A failed cache write or
  invalidation does not roll back a successful database operation.
- Pending invalidations are retried before that application instance accepts cache
  hits after recovery. Corrupt JSON is replaced with a fresh database result.
- Cart/checkout validation and row locking still use PostgreSQL directly. Cached
  display data never decides the final payable amount or available stock.

The cache is eventually consistent. Direct SQL edits, or a writer that exits while
Redis is unavailable, may leave older display data until the entry TTL expires.
Across multiple app instances, a failed invalidation may similarly remain visible
on another instance until retry/TTL. For planned direct database imports, disable
cache during the import or switch to a fresh namespace afterward.

## Verification

Tests use the disposable `phonezone_test` database and a **separate Redis instance**.
Never point `TEST_REDIS_URL` at the development/production cache: the integration
suite deliberately pauses its test Redis briefly to exercise timeout recovery.

```powershell
docker run --rm -d --name phonezone-redis-test -p 127.0.0.1:6380:6379 redis:7-alpine
$env:TEST_REDIS_URL = 'redis://127.0.0.1:6380'
mvn --batch-mode '-Dquarkus.quinoa=false' test
docker stop phonezone-redis-test
```

`src/test/resources/application.properties` defaults to `phonezone_test`; configure
`TEST_DB_JDBC_URL`, `TEST_DB_USERNAME` and `TEST_DB_PASSWORD` for your disposable database.
Ordinary commerce/security tests bypass cache. The Redis integration profile enables
cache and uses a fresh isolated namespace. CI provides a dedicated Redis service.

Coverage includes:

- Real Redis hits, JSON round trips including categories/dates/specification strings.
- Pagination/filter/search key separation; validation and hidden-product isolation.
- TTL/expiration, admin mutations, bulk deletion and import clear.
- Stock updates after placing/cancelling an order; transaction rollback.
- A real paused Redis server: reads and writes succeed during timeout, followed by
  fresh responses when Redis recovers.
- Unit fault injection for unavailable reads, failed writes, retry backoff, corrupt
  JSON, disabled cache and an older read finishing after invalidation.

References: [Quarkus Redis client](https://quarkus.io/guides/redis-reference/),
[Redis CLIENT PAUSE](https://redis.io/docs/latest/commands/client-pause/).
