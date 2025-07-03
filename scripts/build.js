#!/usr/bin/env node

/**
 * Build script for the Customizable Calendar application
 * Creates a dist folder with all deployment-ready files
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Helper function to run shell commands
 * @param {string} command - The command to execute
 * @returns {void}
 */
function runCommand(command) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

/**
 * Helper function to run shell commands safely without exiting on error
 * @param {string} command - The command to execute
 * @returns {boolean} True if successful, false if error
 */
function runCommandSafe(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    return false;
  }
}

/**
 * Helper function to copy files
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 * @returns {void}
 */
function copyFile(src, dest) {
  try {
    console.log(`Copying ${src} to ${dest}`);
    fs.copyFileSync(src, dest);
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
  }
}

/**
 * Helper function to create directory if it doesn't exist
 * @param {string} dir - Directory path to create
 * @returns {void}
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Main build function that creates the dist folder with all deployment files
 * @returns {void}
 */
function build() {
  console.log('🚀 Building Customizable Calendar...\n');

  // Clean and create dist directory
  console.log('📁 Setting up dist directory...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  ensureDir('dist');

  // Try TypeScript compilation first, fall back to JavaScript if it fails
  console.log('📦 Attempting TypeScript compilation...');
  const tsSuccess = runCommandSafe('npx tsc');

  if (tsSuccess) {
    console.log('📦 Building JavaScript from TypeScript...');
    runCommand(
      'npx terser dist/script.js --compress --mangle --output dist/script.min.js'
    );
  } else {
    console.log(
      '⚠️  TypeScript compilation failed, using JavaScript fallback...'
    );
    runCommand(
      'npx terser src/script.js --compress --mangle --output dist/script.min.js'
    );
  }

  // Build CSS
  console.log('🎨 Building CSS...');
  runCommand('npx postcss src/style.css --output dist/style.min.css');

  // Copy HTML file
  console.log('📄 Copying HTML file...');
  copyFile('index.html', 'dist/index.html');

  // Copy LICENSE if it exists
  if (fs.existsSync('LICENSE')) {
    console.log('📜 Copying LICENSE...');
    copyFile('LICENSE', 'dist/LICENSE');
  }

  // Create a simple server script for serving the dist folder
  const serverScript = `#!/usr/bin/env node
// Simple server for serving the dist folder
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript'
  }[ext] || 'text/plain';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;

  fs.writeFileSync('dist/serve.js', serverScript);

  // Get build statistics
  const stats = {
    'index.html': fs.statSync('dist/index.html').size,
    'script.min.js': fs.statSync('dist/script.min.js').size,
    'style.min.css': fs.statSync('dist/style.min.css').size
  };

  console.log('\n✅ Build completed successfully!');
  console.log('\n📊 Build Statistics:');
  Object.entries(stats).forEach(([file, size]) => {
    console.log(`  ${file}: ${(size / 1024).toFixed(2)} KB`);
  });

  console.log('\n🎉 Deployment files ready in dist/ folder');
  console.log('   Run "npm run serve:dist" to test the built application');
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = build;
