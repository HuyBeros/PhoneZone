# Changelog

## Unreleased

- Added JWT customer/admin APIs, bcrypt hashing with legacy upgrades, validation and account ownership checks.
- Updated catalog filtering/pagination and transactional COD/BANK checkout, stock, coupons and rewards.
- Added optional Redis public catalog cache with TTL, post-commit invalidation and database fallback.
- Added clean browser routes, responsive layouts and account-scoped browser wishlists hidden after logout.
- Added isolated frontend/backend tests and GitHub Actions checks.
- Prepared Render/Neon configuration: Flyway baseline, schema validation, database health check, explicit admin bootstrap and environment-based secrets.
- Removed unused starter/legacy frontend files and excluded local/generated/private files from publication.
- Replaced placeholder documentation with setup, testing, deployment and current limitations.

VNPay processing remains unverified while the sandbox is unavailable. Credentials are configured externally; missing credentials reject payment creation before writing an order.
