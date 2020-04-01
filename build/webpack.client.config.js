const webpack = require('webpack')
const merge = require('webpack-merge')
const base = require('./webpack.base.config')
// const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const { GenerateSW } = require('workbox-webpack-plugin') // InjectManifest
// const CopyPlugin = require('copy-webpack-plugin')

const config = merge(base, {
  entry: {
    app: './src/entry-client.js'
  },
  optimization: {
    providedExports: true,
    usedExports: true,
    sideEffects: true,
    concatenateModules: true,
    // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // on every build.
    runtimeChunk: {
      name: 'manifest'
    },
    // extract vendor chunks for better caching
    splitChunks: {
      chunks: 'all',
      minSize: 10000,
      // maxSize: 1500000,
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test (module) {
            // a module is extracted into the vendor chunk if...
            return (
              // it's inside node_modules
              /node_modules/.test(module.context) &&
              // and not a CSS file
              !/\.css$/.test(module.request)
            )
          },
          chunks: 'all',
          minChunks: 2,
          maxInitialRequests: 5
          // minSize: 0,
        }
      }
    }
  },
  plugins: [
    // strip dev-only code in Vue source
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"client"'
    }),
    new VueSSRClientPlugin()
  ]
})

config.plugins.push(
  new GenerateSW({
    swDest: 'service-worker.js',
    skipWaiting: true,
    cacheId: 'mirror-media',
    exclude: [/\.map$/, /\.json$/],
    runtimeCaching: [
      {
        urlPattern: /(localhost:8080|mirrormedia.mg)\/(app|author|category|external|project-list|story|section|tag|topic|video)\/[A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|[\]/\\]+$/,
        handler: 'NetworkFirst'
      },
      {
        urlPattern: /(localhost:8080|mirrormedia.com.tw|mirrormedia.mg|storage.googleapis.com\/mirrormedia-files)\/assets\/(?!audios\/)[A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|[\]/\\]+.[\s\S]+$/,
        handler: 'NetworkFirst'
      },
      {
        urlPattern: /(localhost:8080|mirrormedia.mg)\/?$/,
        handler: 'NetworkFirst'
      },
      {
        urlPattern: /(localhost:8080|mirrormedia.mg)\/dist\/[A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|[\]/\\]+.[\s\S]+$/,
        handler: 'NetworkFirst'
      },
      {
        urlPattern: /(localhost:8080|mirrormedia.mg)\/api\/(?!tracking)[A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|[\]/\\]+$/,
        handler: 'NetworkFirst'
      }
    ]
  })
  // new InjectManifest({
  //   swSrc: './firebase-messaging-sw.js'
  // }),
  // new CopyPlugin([
  //   { from: 'firebase-messaging-sw.js', to: 'firebase-messaging-sw.js' }
  // ])
)

module.exports = config
