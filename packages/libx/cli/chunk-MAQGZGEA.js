import path from 'node:path';
import { pathToFileURL } from 'node:url';

// src/config.ts
var loadConfig = async () => {
  const configPath = path.resolve("libx.config.js");
  const configURL = pathToFileURL(configPath);
  try {
    const config = (await import(configURL.href)).default;
    return config;
  } catch {
    return {};
  }
};
var defineConfig = (config) => config;

export { defineConfig, loadConfig };
