# Contributing

Follow the local setup in [README.md](README.md) or [README.vi.md](README.vi.md).

1. Create a focused branch and preserve behavior outside the change.
2. Keep HTTP handling in controllers, business rules in services, request validation in DTOs and persistence mappings in entities. Keep multi-row writes transactional.
3. Add forward-only Flyway migrations for production schema changes. Never edit an already deployed migration or rely on Hibernate update in production.
4. Check role and ownership requirements on protected APIs. Do not return password hashes or internal exception details.
5. Run relevant checks from the README. Database and Redis integration tests need disposable services.
6. Run `node scripts/check-repository.mjs`, stage intended changes, then run `node scripts/check-repository.mjs --staged`. Review the staged diff.

Do not commit real credentials, private keys, personal database exports, generated files or local editor/agent settings. The public test key fixtures are only for automated tests.

PRs should explain the problem, resulting behavior and validation performed. Keep UI accessible and verify narrow/mobile layouts. Include screenshots when useful.

Report bugs through [GitHub Issues](https://github.com/HuyBeros/PhoneZone/issues), without credentials or private customer data. Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
