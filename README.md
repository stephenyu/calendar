# Customizable Calendar Application

A web-based calendar application that allows users to create customized yearly calendars with highlighted periods using YAML configuration.

## Features

- **YAML Configuration**: Configure years and highlight periods using simple YAML syntax
- **Color Picker**: Interactive color picker (triggered by typing '#' in config)
- **URL Sharing**: Share calendar configurations via compressed URLs
- **Multi-Year Support**: Display multiple years in a single view
- **Flexible Highlighting**: Support for date ranges and individual dates
- **Legend Display**: Automatic legend generation for labeled periods
- **Responsive Design**: Mobile-friendly layout with side-by-side config and calendar view

## Demo

🌐 **Live Demo**: https://stephenyu.github.io/calendar/

## Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/stephenyu/calendar.git
   cd calendar
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm run dev
   ```

4. **Build for production**:

   ```bash
   npm run build
   ```

5. **Test the built application**:
   ```bash
   npm run serve:dist
   ```

## Configuration Format

The calendar uses YAML configuration with the following structure:

```yaml
years:
  - 2024
  - 2025

highlightPeriods:
  # Date range with label
  - start: '2024-12-23'
    end: '2024-12-31'
    color: '#ffd700'
    label: 'Holiday Period'

  # Single date
  - dates:
      - '2025-02-14'
    color: '#ff69b4'
    label: "Valentine's Day"

  # Multiple individual dates
  - dates:
      - '2025-01-01'
      - '2025-07-04'
      - '2025-12-25'
    color: '#ff0000'
    label: 'Public Holidays'
```

### Configuration Options

- **years**: Array of years to display
- **highlightPeriods**: Array of period objects with:
  - `start/end`: Date range (YYYY-MM-DD format)
  - `dates`: Array of individual dates
  - `color`: CSS color value (hex, rgb, or named colors)
  - `label`: Optional label for legend display

## Usage

1. **Enter Configuration**: Type or paste YAML configuration in the left panel
2. **Color Picker**: Type '#' to open the color picker modal
3. **Save & View**: Click "Save" to generate the calendar
4. **Share**: Copy the URL to share your calendar configuration

## Development

### Project Structure

```
calendar/
├── src/
│   ├── script.js      # Main application logic
│   ├── style.css      # Styles and layout
│   └── opt.js         # YAML compression utilities
├── scripts/
│   └── build.js       # Cross-platform build script
├── __tests__/         # Test files
├── index.html         # Main HTML file
├── package.json       # Dependencies and scripts
└── README.md         # Documentation
```

### Build Output

When you run `npm run build`, the production files are created in the `dist/` folder:

```
dist/
├── index.html         # Production HTML
├── script.min.js      # Minified JavaScript
├── style.min.css      # Minified CSS
├── serve.js           # Simple Node.js server
└── LICENSE           # License file
```

The `dist/` folder contains everything needed for deployment.

### Scripts

- `npm run build`: Build production files to dist/ folder
- `npm run build:node`: Cross-platform build using Node.js (alternative)
- `npm run build:js`: Build JavaScript only
- `npm run build:css`: Build CSS only
- `npm run serve:dist`: Serve built application from dist/ folder
- `npm run serve:dist:node`: Serve using Node.js server (cross-platform)
- `npm run dev`: Start development server
- `npm run test`: Run tests
- `npm run lint`: Check code quality
- `npm run validate`: Run linting and tests

### Dependencies

- **js-yaml**: YAML parsing and generation
- **lz-string**: URL compression for sharing
- **cssnano**: CSS minification
- **postcss-cli**: CSS processing
- **terser**: JavaScript minification

## Architecture

The application follows a simple client-side architecture:

1. **Configuration Parser**: Parses YAML configuration using js-yaml
2. **Calendar Generator**: Creates HTML calendar grids for each year
3. **Highlight Engine**: Applies colors and styling to specified dates
4. **URL Compression**: Compresses configuration for URL sharing
5. **Modal System**: Color picker interface

## Browser Support

- Modern browsers supporting ES6+ features
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

See [TASK_LIST.md](TASK_LIST.md) for planned improvements and current development tasks.
