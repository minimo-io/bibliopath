// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/bibliopath/'
    : '/'
  ,
  configureWebpack: {
     optimization: {
       splitChunks: false
     },
     output: {
        filename: "js/bibliopath.js"
     },
  },
  chainWebpack: config => {
    config.optimization.delete('splitChunks') // no vendor chunks
    config.plugins.delete('prefetch')         // no prefetch chunks
    config.plugins.delete('preload')          // no preload chunks

    if (config.plugins.has("extract-css")) {
      const extractCSSPlugin = config.plugin("extract-css");
      extractCSSPlugin &&
        extractCSSPlugin.tap(() => [
          {
            filename: "css/bibliopath.css",
            chunkFilename: "css-bibliopath-[name].css"
          }
        ]);
    }
  }
  // configureWebpack: config => {
  //   if (process.env.NODE_ENV === 'production') {
  //     // mutate config for production...
  //   } else {
  //     // mutate for development...
  //   }
  // },
  //chainWebpack: config => {
    // config.module.rule('epub')
    //   .test(/\.(epub)(\?.*)?$/)
    //   .use('file-loader')
    //     .loader('file-loader')
    //     .options({
    //       name: 'assets/books/[name].[hash:8].[ext]'
    // });

  //},

}
