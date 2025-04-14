const CopyPlugin = require('copy-webpack-plugin');

// Export a function that configures webpack
module.exports = function(env, argv) {
  return {
    // Add rules for WASM
    module: {
      rules: [
        {
          test: /\.wasm$/,
          type: 'asset/resource',
        },
      ],
    },
    // Add plugins for copying files
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'node_modules/@ricky0123/vad-web/dist/*.worklet.js', to: '[name][ext]' },
          { from: 'node_modules/@ricky0123/vad-web/dist/*.onnx', to: '[name][ext]' },
          { from: 'node_modules/onnxruntime-web/dist/*.wasm', to: '[name][ext]' },
        ],
      }),
    ],
  };
};