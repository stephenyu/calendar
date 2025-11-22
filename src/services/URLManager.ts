/**
 * @fileoverview URL management service
 * Handles compression/decompression of configuration for URL sharing
 */

import { load, dump } from 'js-yaml';
import {
  CalendarConfig
} from '../types.js';
import { compressYAML, decompressJSON } from '../opt.js';

// External library declarations (loaded from CDN in browser)
declare const LZString: {
  compressToEncodedURIComponent(str: string): string;
  decompressFromEncodedURIComponent(str: string): string;
};

/**
 * Retrieves and decompresses configuration from URL parameters
 * @returns Decompressed CalendarConfig or null if not found/error
 */
export function getConfigFromURL(): CalendarConfig | null {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  const configParam: string | null = params.get('config');
  if (!configParam) {
    return null;
  }

  try {
    const compressedJSON: string =
      LZString.decompressFromEncodedURIComponent(configParam);
    const yamlString = decompressJSON(compressedJSON);
    if (!yamlString) {
      return null;
    }

    return load(yamlString) as CalendarConfig;
  } catch (e) {
    const error = e as Error;
    console.error('[URLManager] Error decoding configuration from URL:', error);
    return null;
  }
}

/**
 * Updates the browser URL with compressed configuration data
 * @param config - The CalendarConfig to compress and store
 */
export function updateURLWithConfig(config: CalendarConfig): void {
  const yamlString = dump(config);
  const compressedJSON: string | null = compressYAML(yamlString);

  if (!compressedJSON) {
    console.error('[URLManager] Failed to compress config');
    return;
  }

  const compressed: string =
    LZString.compressToEncodedURIComponent(compressedJSON);
  const newURL: string = `${window.location.protocol}//${window.location.host}${window.location.pathname}?config=${compressed}`;
  window.history.replaceState({ path: newURL }, '', newURL);
}

