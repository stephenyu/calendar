/**
 * @fileoverview YAML Preprocessor
 * Converts user-friendly unquoted format to properly quoted YAML
 * 
 * Rules:
 * - Values starting with # (hex colors) get quoted
 * - Date-like values (YYYY-MM-DD) get quoted
 * - Everything else stays as-is
 */

/**
 * Detects if a string looks like a hex color (#fff, #ffd700, etc.)
 */
function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

/**
 * Detects if a string looks like a date (YYYY-MM-DD)
 */
function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/**
 * Checks if a value is already quoted
 */
function isQuoted(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

/**
 * Preprocesses YAML to add quotes where needed
 * 
 * @param yaml - Raw YAML string from user
 * @returns YAML string with proper quotes added
 * 
 * @example
 * Input:
 *   color: #ffd700
 *   start: 2025-12-01
 * 
 * Output:
 *   color: "#ffd700"
 *   start: "2025-12-01"
 */
export function preprocessYAML(yaml: string): string {
  const lines = yaml.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      processedLines.push(line);
      continue;
    }

    const trimmedLine = line.trim();
    
    // Check if this is a simple array item (starts with - but has no colon, or value after dash is a date/color)
    if (trimmedLine.startsWith('-')) {
      const dashIndex = line.indexOf('-');
      const afterDash = line.substring(dashIndex + 1).trim();
      
      // Check if afterDash has a colon (meaning it's like "- start: 2025-12-01")
      const colonInArrayItem = afterDash.indexOf(':');
      
      if (colonInArrayItem === -1) {
        // Simple array item: "  - 2025-01-01" or "  - #ffd700"
        if (afterDash && !isQuoted(afterDash)) {
          if (isHexColor(afterDash) || isDateString(afterDash)) {
            const beforeDash = line.substring(0, dashIndex + 1);
            processedLines.push(`${beforeDash} "${afterDash}"`);
            continue;
          }
        }
        processedLines.push(line);
        continue;
      } else {
        // Array item with key-value: "  - start: 2025-12-01"
        const beforeColon = afterDash.substring(0, colonInArrayItem);
        const afterColon = afterDash.substring(colonInArrayItem + 1).trim();
        
        if (afterColon && !isQuoted(afterColon)) {
          if (isHexColor(afterColon) || isDateString(afterColon)) {
            const beforeDash = line.substring(0, dashIndex + 1);
            processedLines.push(`${beforeDash} ${beforeColon}: "${afterColon}"`);
            continue;
          }
        }
        processedLines.push(line);
        continue;
      }
    }

    // Check if this is a key-value line (contains colon)
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      // Not a key-value line
      processedLines.push(line);
      continue;
    }

    // Split into key and value parts
    const beforeColon = line.substring(0, colonIndex);
    const afterColon = line.substring(colonIndex + 1);

    // If there's no value after colon, it's probably a parent key
    if (afterColon.trim() === '') {
      processedLines.push(line);
      continue;
    }

    // Extract the value (everything after colon, trimmed)
    const value = afterColon.trim();

    // Check if value is already quoted
    if (isQuoted(value)) {
      processedLines.push(line);
      continue;
    }

    // Regular key-value pair
    if (isHexColor(value) || isDateString(value)) {
      // Add quotes around the value
      const indent = beforeColon.match(/^\s*/)?.[0] || '';
      const key = beforeColon.trim();
      processedLines.push(`${indent}${key}: "${value}"`);
    } else {
      // Keep as-is
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

/**
 * Helper function to format YAML safely
 * Accepts both quoted and unquoted input
 * 
 * @param yaml - Raw YAML from user (quoted or unquoted)
 * @returns Properly formatted YAML ready for js-yaml parsing
 */
export function normalizeYAML(yaml: string): string {
  return preprocessYAML(yaml);
}

