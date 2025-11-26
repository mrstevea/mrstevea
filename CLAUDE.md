# CLAUDE.md - AI Assistant Guide for mrstevea Repository

## Repository Overview

**Repository:** mrstevea/mrstevea
**Status:** New repository (initialized)
**Last Updated:** 2025-11-26

This is a personal repository that is currently in its initial setup phase. This document serves as a comprehensive guide for AI assistants working with this codebase.

---

## Current State

This repository is currently empty and awaiting initial project setup. Future updates to this document should reflect the actual project structure and conventions as they are established.

---

## Project Structure

```
mrstevea/
├── .git/               # Git version control
└── CLAUDE.md          # This file - AI assistant guide
```

### Expected Structure (To Be Established)

As the project develops, update this section to reflect the actual structure:

```
mrstevea/
├── src/               # Source code
├── tests/             # Test files
├── docs/              # Documentation
├── .github/           # GitHub workflows and templates
├── package.json       # Project dependencies (if Node.js)
├── README.md          # Project README
└── CLAUDE.md         # This file
```

---

## Development Workflows

### Git Branching Strategy

**Branch Naming Convention:**
- Feature branches: `feature/<descriptive-name>`
- Bug fixes: `fix/<issue-description>`
- Documentation: `docs/<topic>`
- Claude AI branches: `claude/<session-id>` (auto-generated)

**Current Working Branch:** `claude/claude-md-mifb3zzr2m92h9mt-016g9FEbnPRUqZSWDh84o4tY`

### Commit Message Guidelines

Follow conventional commit format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user authentication system
fix(api): resolve null pointer in user endpoint
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch:** Branch from main/master
2. **Develop:** Make changes with clear, atomic commits
3. **Test:** Ensure all tests pass
4. **Push:** Push to feature branch
5. **PR:** Create pull request with description
6. **Review:** Address review comments
7. **Merge:** Merge after approval

---

## Code Quality Standards

### General Principles

1. **KISS (Keep It Simple, Stupid):** Avoid over-engineering
2. **DRY (Don't Repeat Yourself):** Minimize code duplication
3. **YAGNI (You Aren't Gonna Need It):** Don't add functionality until needed
4. **Single Responsibility:** Each module/function should do one thing well

### Code Style

- Follow established language conventions
- Use meaningful variable and function names
- Keep functions small and focused
- Comment complex logic, not obvious code
- Prefer readability over cleverness

### Security Considerations

- Never commit secrets, API keys, or credentials
- Validate all user input
- Follow OWASP top 10 security guidelines
- Use environment variables for configuration
- Keep dependencies updated

---

## Testing Strategy

### Testing Levels

1. **Unit Tests:** Test individual functions/components
2. **Integration Tests:** Test module interactions
3. **End-to-End Tests:** Test complete user workflows

### Testing Best Practices

- Write tests alongside new features
- Aim for meaningful test coverage, not just high percentages
- Test edge cases and error conditions
- Keep tests independent and idempotent
- Use descriptive test names

---

## AI Assistant Guidelines

### When Making Changes

1. **Always Read First:** Never propose changes to code you haven't read
2. **Understand Context:** Review related files and dependencies
3. **Minimal Changes:** Only modify what's necessary
4. **Test Before Commit:** Verify changes work as expected
5. **Clear Communication:** Explain what you're doing and why

### File Operations

**Prefer:**
- Editing existing files over creating new ones
- Reading files with `Read` tool over bash `cat`
- Using dedicated tools (`Edit`, `Write`) over bash commands

**Avoid:**
- Creating unnecessary documentation files
- Over-commenting code
- Adding unused imports or dependencies
- Premature optimization

### Common Tasks

#### Adding a New Feature
1. Read relevant existing code
2. Plan the implementation (use TodoWrite for complex tasks)
3. Write the feature code
4. Add tests
5. Update documentation if needed
6. Commit with clear message

#### Fixing a Bug
1. Identify and understand the bug
2. Read the affected code
3. Write a failing test (if possible)
4. Fix the bug
5. Verify test passes
6. Commit the fix

#### Refactoring Code
1. Ensure tests exist and pass
2. Make small, incremental changes
3. Run tests after each change
4. Maintain identical behavior
5. Commit frequently

---

## Dependencies and Build

### Package Management

*To be updated when dependencies are added*

**Expected package managers:**
- Node.js: `npm` or `yarn`
- Python: `pip` or `poetry`
- Other: TBD based on project type

### Build Process

*To be updated when build process is established*

### Environment Setup

*To be updated with setup instructions*

---

## Common Commands

### Git Commands

```bash
# Check status
git status

# Create new branch
git checkout -b <branch-name>

# Commit changes
git add .
git commit -m "feat: description"

# Push changes (with retry logic for network issues)
git push -u origin <branch-name>

# Fetch updates
git fetch origin

# Pull latest changes
git pull origin <branch-name>
```

### Development Commands

*To be updated based on project type*

```bash
# Install dependencies
# npm install  OR  pip install -r requirements.txt

# Run tests
# npm test  OR  pytest

# Build project
# npm run build  OR  python setup.py build

# Start development server
# npm run dev  OR  python manage.py runserver
```

---

## Project-Specific Conventions

### Naming Conventions

*To be established based on project language and framework*

**Files:**
- Use kebab-case for most files: `user-service.js`
- Use PascalCase for components: `UserProfile.jsx`
- Use lowercase for config: `package.json`, `.gitignore`

**Code:**
- Variables/Functions: camelCase
- Classes/Components: PascalCase
- Constants: UPPER_SNAKE_CASE
- Private members: _leadingUnderscore (language-dependent)

### Directory Organization

*To be established based on project needs*

**Suggested structure:**
- Group by feature (recommended for large projects)
- Group by type (recommended for small projects)
- Hybrid approach (common for medium projects)

### Error Handling

*To be established based on project patterns*

**General guidelines:**
- Always handle errors gracefully
- Log errors with sufficient context
- Use appropriate error types
- Don't swallow errors silently

---

## Documentation Requirements

### Code Documentation

- Document public APIs
- Explain complex algorithms
- Note important assumptions
- Include usage examples for utilities

### File Headers

*Optional - to be decided based on project needs*

```javascript
/**
 * @file user-service.js
 * @description Handles user authentication and authorization
 * @author mrstevea
 */
```

### README Updates

Keep README.md updated with:
- Project description and purpose
- Installation instructions
- Usage examples
- Contributing guidelines
- License information

---

## CI/CD Pipeline

*To be configured*

**Recommended checks:**
- Automated testing
- Code linting
- Security scanning
- Build verification
- Test coverage reporting

---

## Troubleshooting

### Common Issues

*To be populated as issues are encountered and resolved*

### Debug Strategies

1. Read error messages carefully
2. Check recent changes
3. Verify environment setup
4. Review logs
5. Use debugger or print statements
6. Search for similar issues
7. Ask for help if stuck

---

## Resources

### Documentation

*Add links to relevant documentation*

- Project README: (to be created)
- API Documentation: (if applicable)
- Design Documents: (if applicable)

### External Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## Changelog

### 2025-11-26
- Initial CLAUDE.md created
- Repository initialized
- Basic structure and guidelines established

---

## Notes for Future Updates

This document should be updated whenever:
- Project structure changes significantly
- New conventions are established
- Build process is modified
- New dependencies are added
- Common issues are identified and resolved

**Maintenance:** Review and update this document quarterly or after major changes.

---

## Contact

**Repository Owner:** mrstevea
**Issues:** Use GitHub Issues for bug reports and feature requests
**Questions:** (Add preferred contact method)

---

*This document is a living guide. All AI assistants working with this codebase should read this file first and keep it updated as the project evolves.*
