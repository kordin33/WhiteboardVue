
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Output to Django's static folder
  outputDir: '../static/vue/',
  
  // Add static asset path prefix for production
  publicPath: process.env.NODE_ENV === 'production' ? '/static/vue/' : '/',
  
  // Configure webpack dev server for local development
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      '^/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true
      }
    }
  },

  // Configure webpack to properly handle vue-router in history mode
  configureWebpack: {
    resolve: {
      fallback: {
        // Node.js polyfills for browser
        path: require.resolve('path-browserify'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify')
      }
    },
    // Feature flags for Vue 3
    plugins: [
      // Add plugins if needed
    ]
  },

  chainWebpack: config => {
    // Define feature flags
    config.plugin('define').tap(args => {
      args[0]['__VUE_PROD_HYDRATION_MISMATCH_DETAILS__'] = JSON.stringify(false);
      return args;
    });
  }
})
