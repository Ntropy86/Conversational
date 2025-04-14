const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const fs = require('fs');

module.exports = function override(config, env) {
  // Add WASM handling
  const wasmExtensionRegExp = /\.wasm$/;
  config.resolve.extensions.push('.wasm');
  
  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // Check if config already has plugins
  if (!config.plugins) {
    config.plugins = [];
  }

  // Don't try to use CopyPlugin for files that might not exist
  // Instead, we'll use CDN links directly in our code
  
  return config;
}