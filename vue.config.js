const path = require("path");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');//压缩代码


function resolve(dir) {
  return path.join(__dirname, dir)
}
    
 
module.exports = {
   // 配置webpack
   configureWebpack: config => {
    if (true) {
      // 开启分离js
      config.optimization = {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name (module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`
              }
            }
          }
        }
      };
    }
  },
  baseUrl: './',
  lintOnSave: false,//暂时关闭eslint
  // 开发端口
  devServer: {
    host: '192.168.3.70',
    port: 8081,
    https: false,
    hotOnly: false,
    proxy: { // 设置代理
      '/api': {
        target: 'http://192.168.3.85:8200/api',
        // target: 'http://192.168.3.60:8200/api',
        // target: 'http://192.168.3.85:8200/api',
        // http://192.168.3.85:9091/main
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': ''
        }
      },
      // 阿里云
      '/aly': {
        target: 'https://ufscs-scf-prod.oss-cn-shenzhen.aliyuncs.com/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/aly': ''
        }
      },
    },
    disableHostCheck: true
  },
  // 配置别名
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
      .set('_conf', resolve('config'))
    //设置打包后js目录，并添加hash
    const filename = path.posix.join('js',`${new Date().getTime()}.[name].[hash:8].js`);
    config.mode('production').devtool(false).output.filename(filename).chunkFilename(filename)
  },
  // 打包时不生成.map文件
  productionSourceMap: false,

  pwa: {
    iconPaths: {
      favicon32: 'favicon1.ico',
      favicon16: 'favicon1.ico',
      appleTouchIcon: 'favicon1.ico',
      maskIcon: 'favicon1.ico',
      msTileImage: 'favicon1.ico'
    }
  }
}