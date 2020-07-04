// vue.config.js
module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // mutate config for production...
    } else {
      // mutate for development...
    }
  },
  chainWebpack: config => {
    config.module.rule('epub')
      .test(/\.(epub)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: 'assets/books/[name].[hash:8].[ext]'
        });
  },

}
