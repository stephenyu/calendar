# Changelog

All notable changes to the Customizable Calendar project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Tooltip Feature** [SF, RP, TDT]
  - Interactive tooltips on hover for colored calendar segments
  - Display period labels when hovering over highlighted dates
  - Support for multiple overlapping period labels
  - Smooth, modern tooltip styling with arrow indicator
  - Comprehensive test coverage (15 new tests)
  - Smart filtering of unlabeled periods from tooltip display

### Changed
- **Calendar Rendering Enhancement**
  - Modified `getColorsForDate()` to return both colors and matching period objects
  - Updated `createMonthTable()` to store period labels in data attributes
  - Added `has-highlight` CSS class for interactive cursor feedback
  - Implemented tooltip initialization system in calendar renderer

### Technical Details
- 249 lines added across 5 files
- All 101 tests passing
- Zero linter errors
- Fully typed TypeScript implementation
- [AC, DRY, RP] principles applied throughout

## [1.0.0] - 2024-12-XX

### Added
- **Comprehensive Documentation**
  - Complete README.md with installation, usage, and development instructions
  - CONTRIBUTING.md with development guidelines and standards
  - JSDoc comments for all major functions in src/script.js
  - Detailed YAML configuration format documentation

- **Development Tooling**
  - ESLint configuration with JavaScript Standard Style
  - Prettier configuration for consistent code formatting
  - Jest testing framework with initial test suite
  - VS Code workspace settings for optimal development experience
  - GitHub Actions CI/CD pipeline for automated testing and deployment

- **Project Structure**
  - Updated package.json with modern development scripts
  - Comprehensive .gitignore file excluding build artifacts and IDE files
  - Proper project metadata, keywords, and browser compatibility

- **Code Quality**
  - JSDoc documentation for 15+ functions
  - Consistent coding standards with ESLint
  - Automated code formatting with Prettier
  - Test coverage reporting with Jest

- **Testing Infrastructure**
  - Jest configuration with jsdom environment
  - Initial test suite covering:
    - DOM manipulation
    - YAML configuration parsing
    - Date utilities
    - URL compression/decompression
    - Color validation
    - Error handling

- **CI/CD Pipeline**
  - Automated testing on multiple Node.js versions
  - Code quality checks with ESLint
  - Test coverage reporting
  - Automated deployment to GitHub Pages
  - Build artifact management

### Changed
- **Package.json Enhancement**
  - Added comprehensive development dependencies
  - Included modern npm scripts (dev, lint, test, validate)
  - Added proper project metadata and keywords
  - Set engine requirements for Node.js and npm

- **Code Organization**
  - Added comprehensive JSDoc comments to main functions
  - Improved code documentation and readability
  - Standardized function naming and structure

### Fixed
- **Development Environment**
  - Proper dependency management with package-lock.json
  - Excluded build artifacts from version control
  - Configured appropriate file ignoring patterns

## [0.1.0] - Legacy Version

### Initial Features
- YAML configuration for calendar years and highlight periods
- Multi-year calendar display with month grids
- Color-coded date highlighting with support for:
  - Date ranges (start/end dates)
  - Individual dates
  - Multiple overlapping periods
- Interactive color picker modal (triggered by '#' key)
- URL sharing with compressed configuration
- Legend display for labeled periods
- Responsive design with side-by-side layout
- Export functionality for minified CSS and JavaScript

### Technical Implementation
- Vanilla JavaScript, HTML, and CSS
- YAML parsing with js-yaml library
- URL compression using lz-string
- Build process with Terser and PostCSS
- Client-side calendar generation and rendering

---

## Migration Notes

### For Existing Users
- All existing functionality remains intact
- URL sharing continues to work with existing links
- No breaking changes to YAML configuration format
- Development workflow significantly improved

### For Developers
- New development server available with `npm run dev`
- Testing framework ready with `npm test`
- Code quality tools integrated with `npm run lint`
- Comprehensive documentation for contribution

### Future Roadmap
- See [TASK_LIST.md](TASK_LIST.md) for planned improvements
- Modular code architecture planned for v2.0.0
- Additional export formats (PDF, iCal) under consideration
- Mobile experience improvements in development

---

**Legend:**
- `Added` - New features
- `Changed` - Changes to existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Now removed features
- `Fixed` - Bug fixes
- `Security` - Vulnerability fixes
