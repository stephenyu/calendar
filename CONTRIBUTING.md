# Contributing to Customizable Calendar

Thank you for your interest in contributing to the Customizable Calendar project! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (version 8 or higher)
- Git

### Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/calendar.git
   cd calendar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Run linter**:
   ```bash
   npm run lint
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/improvements

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions or modifications
- `chore` - Maintenance tasks

**Examples:**
```
feat(calendar): add export to PDF functionality
fix(modal): resolve color picker positioning issue
docs(readme): update installation instructions
test(calendar): add tests for leap year handling
```

## Code Standards

### JavaScript

- Use ES6+ features
- Follow the existing code style (ESLint configuration)
- Add JSDoc comments for all functions
- Use meaningful variable and function names
- Keep functions small and focused (max 30 lines)

### CSS

- Use semantic class names
- Follow BEM methodology where applicable
- Maintain responsive design principles
- Use CSS custom properties for theming

### HTML

- Use semantic HTML5 elements
- Maintain accessibility standards
- Keep markup clean and minimal

## Testing

### Test Structure

- Unit tests for individual functions
- Integration tests for user workflows
- All tests should be in the `__tests__` directory
- Test files should end with `.test.js`

### Test Requirements

- Write tests for all new functionality
- Maintain test coverage above 80%
- Include both positive and negative test cases
- Mock external dependencies appropriately

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments for all functions and classes
- Include parameter types and return values
- Provide usage examples for complex functions
- Document any side effects or dependencies

### User Documentation

- Update README.md for new features
- Include configuration examples
- Provide troubleshooting information
- Keep documentation up to date

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code standards
3. **Add/update tests** for your changes
4. **Update documentation** as needed
5. **Run the validation suite**:
   ```bash
   npm run validate
   ```
6. **Create a pull request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots for UI changes
   - Test results

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Issue Reporting

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use cases and rationale
- Proposed implementation (if any)
- Impact on existing functionality

## Code Review Process

### For Contributors

- Be open to feedback and suggestions
- Respond to review comments promptly
- Make requested changes in additional commits
- Squash commits before merging (if requested)

### For Reviewers

- Provide constructive feedback
- Focus on code quality and maintainability
- Test functionality when possible
- Approve only when satisfied with changes

## Release Process

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create release tag
4. Deploy to GitHub Pages (automatic)
5. Create GitHub release with notes

## Questions and Support

- Check existing issues and documentation first
- Create a new issue for questions
- Use appropriate labels for categorization
- Be patient and respectful in communications

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors section
- Release notes for significant contributions

Thank you for contributing to the Customizable Calendar project!
