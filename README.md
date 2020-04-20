# vue.config.js优化

脚手架webpack默认配置，build集成dist包，chunk少而且会很大，导致网站初次加载文件时间边长，而且在项目迭代中，每次build生成的文件名称都是一样的，所以加载时，浏览器比对时，文件数量与名称没有变化，会走缓存，不会更新，这样不便于用户操作，针对这些问题，以下方案可以借鉴。

#### webpack基本配置

```javascript
const path = require("path");
const os = require('os');
///////////////////获取本机ip///////////////////////
function getIPAdress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              return alias.address;
          }
      }
  }
}
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, dir)
} 


module.exports = {
  // 配置webpack
  configureWebpack: config => {
    if (isProduction) {
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
  // configureWebpack: {
  //   externals: {
  //     vue: 'Vue',
  //     'vue-router': 'VueRouter',
  //     echarts:'echarts'
  //   }
  // },
  // Project deployment base
  // By default we assume your app will be deployed at the root of a domain,
  // e.g. https://www.my-app.com/
  // If your app is deployed at a sub-path, you will need to specify that
  // sub-path here. For example, if your app is deployed at
  // https://www.foobar.com/my-app/
  // then change this to '/my-app/'
  // baseUrl: '',
  assetsDir: 'service',
  lintOnSave: false,
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
      .set('_conf', resolve('config'));
      //设置打包后js目录，并添加hash
 const filename = path.posix.join('js',`${new Date().getTime()}.[name].[hash:8].js`);
 config.mode('production').devtool(false).output.filename(filename).chunkFilename(filename)
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
  // devServer: {
  //   proxy: 'localhost:3000'
  // }      
  devServer: {
    open: true, //浏览器自动打开页面
    host: getIPAdress(), //如果是真机测试，就使用这个IP
    // host: "localhost", 
    // host: "192.168.1.123", //如果是真机测试，就使用这个IP 192.168.6.14
    port: 8092,       
    https: false,
    hotOnly: false, //热更新（webpack已实现了，这里false即可）
    proxy: {
      //配置跨域
      '/api': {
        // target: "http://192.168.3.57:8200/api",  // chenyin
        // target: "http://192.168.3.98:8200/api",  // zhengfeng 
        // target: "http://192.168.3.63:8200/api",  // jinghang
        // target: "http://192.168.3.45:8200/api", //sanceng
        target: "http://192.168.3.83:8200/api", //dage
        // target: "http://192.168.1.141:8200/api", //dage
        // target: "http://192.168.3.83:8200/api", //zehua
        
        // target: "http://192.168.3.71:8200/api", //jianbing
        ws:true, 
        changOrigin:true,
        pathRewrite:{    
          '^/api':'/'
        }
      },
      // 阿里云
      '/aly': {
        target: 'https://rm-dev.oss-cn-beijing.aliyuncs.com/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/aly': ''
        }
      }
    }
  },
  pwa: {
    iconPaths: {
      favicon32: 'log1.png',
      favicon16: 'log1.png',
      appleTouchIcon: 'log1.png',
      maskIcon: 'log1.png',
      msTileImage: 'log1.png'
    }
  }
}

```

#### 分包

减少包的大小，细分包的数量，加快网站解析。

拆分第三方包(vue、vue-router、......)，

```javascript
// 配置webpack
  configureWebpack: config => {
    if (isProduction) {
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
  }
```

#### 随机文件名称

清除浏览器缓存。

在build的时，生成文件时，可以加入随机值，使文件名称不确定性，迫使浏览器读取网站更新文件。



```javascript
 chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
      .set('_conf', resolve('config'));
      //设置打包后js目录，并添加hash
 const filename = path.posix.join('js',`${new Date().getTime()}.[name].[hash:8].js`);
 config.mode('production').devtool(false).output.filename(filename).chunkFilename(filename)
  },
```

