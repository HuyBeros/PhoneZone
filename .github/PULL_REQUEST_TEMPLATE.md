## Description
Briefly describe the change and its motivation.

Fixes #(issue)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement or code refactoring

## Checklist
- [ ] My code follows the code style and conventions of this project.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code where necessary.
- [ ] I have updated corresponding documentation (`README.md`, `README.vi.md`, etc.).
- [ ] I have added tests that prove my fix is effective or that my feature works.
- [ ] All new and existing tests pass locally:
  - Backend tests: `./mvnw test "-Dquarkus.quinoa=false"`
  - Frontend tests: `npm --prefix src/main/webui test`
  - Frontend build: `npm --prefix src/main/webui run build`
