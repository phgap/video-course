# Loader开发
* ### Why
当下前端社区里最为流行的三大框架 React、Angular.js 和 Vue，它们的一些语法，比如 JSX 和 Vue 指令，这些都是浏览器无法直接解析的，也需要经过构建工具进行转换，而 webpack 毫无疑问是前端构建领域里最耀眼的一颗星。无论你前端走那条线，你都要有很强的 webpack 知识。熟悉 webpack 的使用和原理可以让你拓宽前端技术栈，在发现页面打包的速度和资源体积的问题时能够知道如何排查问题和优化手段，同时，熟悉 webpack 的原理将会对其它跨端开发比如小程序、Weex、ReactNative、Electron 等框架的打包快速上手。

* ### How
因此本课程设计的时候遵循由浅入深的原则，从最简单的webpack loader和plugin的写法开始，逐步学习编写自定义loader和plugin的方法与技巧，并在阅读现有流行的loader和plugin源码后，编写自己项目中可用的loader和plugin

* ### Loader概述
  * 概念：
  > loader 用于对模块的源代码进行转换。loader 可以使你在 import 或 "load(加载)" 模块时预处理文件。因此，loader 类似于其他构建工具中“任务(task)”，并提供了处理前端构建步骤的得力方式。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 import CSS 文件！
  * 使用方法：
    * 安装
    ```sh
    npm install xxxx
    ```
    * 配置
    ```js
    // 只需要一个loader
    module.exports = {
        module: {
            rules: [
                { test: /\.ts$/, use: 'ts-loader' }
            ]
        }
    };
    ```
    ```js
    // 多个loader配合
    module.exports = {
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        // style-loader
                        { loader: 'style-loader' },
                        // css-loader
                        { loader: 'css-loader' },
                        // sass-loader
                        { loader: 'sass-loader' }
                    ]
                }
            ]
        }
    };
    ```
    * 执行时机
webpack在编译（Compile）源代码时，会递归的处理被import/require的模块，使用对应的loader进行代码转换。

  * loader分类
    * 同步loader
loader内部的处理中，如果都是以同步阻塞方式去执行的时候，此时我们可以将loader定义为同步loader，并交由webpack进行调用。比如在编写一个loader的时候，涉及到处理文本文件时，如果处理的文件比较小，我们就可以使用node的fs.readSync和fs.writeSync进行读写文件，那么此时的loader就可以考虑使用同步loader
    * 异步loader
与同步loader相对应，如果loader内部的处理中，有调用异步函数去做处理时，比如异步文件读写，或者需要发送http请求，此时我们可以将loader定义为异步loader，之后交由webpack进行调用。
    * "Raw"loader
我们来看下官网上的描述：
    > By default, the resource file is converted to a UTF-8 string and passed to the loader. By setting the raw flag, the loader will receive the raw Buffer. Every loader is allowed to deliver its result as String or as Buffer. The compiler converts them between loaders.
    * Pitching Loader
    官网描述：
    > Loaders are always called from right to left. There are some instances where the loader only cares about the metadata behind a request and can ignore the results of the previous loader. The pitch method on loaders is called from left to right before the loaders are actually executed (from right to left).

    ```js
    module.exports = {
        //...
        module: {
            rules: [
                {
                    //...
                    use: ['a-loader', 'b-loader', 'c-loader'],
                },
            ],
        },
    };
    ```
* ### 基础开发
  * loader的Hello world (`src: 01.my-loader-hello-world`)
loader是一个导出为函数的JS模块。
    ```js
    module.exports = function(source) {
        return source;
    }
    ```
  * [loader runner](https://www.npmjs.com/package/loader-runner)调试 (`src: 02.my-loader-loader-runner`)
loader runner允许你在不安装webpack的情况下运行loaders
作用：
    * 作为webpack的依赖包，在webpack中使用它来执行loader
    * 进行loader的开发和调试
使用：
    ```js
    import { runLoaders } from "loader-runner";

    runLoaders({
        resource: "/path/to/resource",
        loaders: ['/path/to/loader1', '/path/to/loader2'],
        context: {},
        readResource: fs.readFile.bind(fs)
    }, function(err, result) {
        // err: 如果有错误，通过改参数返回错误信息
        // result: loader进行文件转换的结果
    })
    ```
  * loader上下文 (`src: 03.my-loader-context`)
    * this.context
    > string，模块所在的目录 
    * this.data
    > object，在 pitch 阶段和 normal 阶段之间共享的 data 对象
    * this.cacheable
    > 函数，用于设置loader的处理结果是否可被缓存
    默认情况下，loader 的处理结果会被标记为可缓存。调用这个方法然后传入 false，可以关闭 loader 处理结果的缓存能力。
    一个可缓存的 loader 在输入和相关依赖没有变化时，必须返回相同的结果。
    * this.callback
    > 函数，同步/异步，通过调用该函数，可以返回模块处理好的结果。期望的参数为：
    ```js
    // 1. 第一个参数必须是 Error 或者 null
    // 2. 第二个参数是一个 string 或者 Buffer。
    // 当参数1和参数2同时传递时，loader会认为当前有错误，抛出异常而忽略content
    // 3. 可选的：第三个参数必须是一个可以被 this module 解析的 source map。
    // 4. 可选的：第四个参数，会被 webpack 忽略，可以是任何东西（例如一些元数据）。
    this.callback(
        err: Error | null,
        content: string | Buffer,
        sourceMap?: SourceMap,
        meta?: any
    );
    ```
    * this.async
    > 告诉 loader-runner 这个 loader 将会异步地回调。返回 this.callback
    * this.emitFile
    > 产生一个文件(loader-runner没有传递该参数)
  * 同步loader (`src: 04.my-loader-sync-loader`)
  * 异步loader (`src: 05.my-loader-async-loader`)
  * 多个loader的执行顺序 (`src: 06.my-loader-multiple-loaders`)
  * raw loader (`src: 07.my-loader-raw-loader`)
    ```js
    module.exports.raw = true;
    ```
  * pitching loader (`src: 08.my-loader-pitching-loader`)
  1. pitch without return
  2. pitch return in pitch-2
  * 错误处理 (`src: 09.my-loader-error-handling`)
  1. throw new Error()
  2. callback的第一个参数
* ### 学轮子 + 造轮子
  * ##### file-loader (60m)
  1. 打开[官网](https://www.npmjs.com/package/file-loader)，查看file-laoder描述
  2. 简单介绍loader的使用
  3. 阅读github源码
     1. loader-utils
        1. getOptions
        2. interpolateName
     2. schema-utils
  4. debug源码
  5. 自己实现
     1. 项目初始化
        1. 安装依赖
        2. 创建文件夹
        3. 创建文件
        4. 拷贝png文件
     2. 编写`index.js`
     3. 编写`my-file-loader.js`
        1. 提取options
        2. check Schema
        3. 生成文件名
        4. 生成目标路径
        5. 拷贝文件
        6. 返回生成的可用路径
     4. 测试
  * ##### style-loader
  > contextify: Return a new request string avoiding absolute paths when possible.
  ```js
  // style-loader's return value:
  import API from "!../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js";
  import domAPI from "!../node_modules/style-loader/dist/runtime/styleDomAPI.js";
  import insertFn from "!../node_modules/style-loader/dist/runtime/insertBySelector.js";
  import setAttributes from "!../node_modules/style-loader/dist/runtime/  setAttributesWithoutAttributes.js";
  import insertStyleElement from "!../node_modules/style-loader/dist/runtime/insertStyleElement.js";
  import styleTagTransformFn from "!../node_modules/style-loader/dist/runtime/styleTagTransform.js";
  import content, * as namedExport from "!!../node_modules/css-loader/dist/cjs.js!./index.css";
        
  var options = {};
  
  options.styleTagTransform = styleTagTransformFn;
  options.setAttributes = setAttributes;
  
  options.insert = insertFn.bind(null, "head");
      
  options.domAPI = domAPI;
  options.insertStyleElement = insertStyleElement;
  
  var update = API(content, options);
  
  export * from "!!../node_modules/css-loader/dist/cjs.js!./index.css";
  export default content && content.locals ? content.locals : undefined;
  ```

  API:
  ```js
  // injectStylesIntoStyleTag.js
  ...
  module.exports = function (...) {
    modulesToDom(...);
    ...

  }

  function modulesToDom(...) {
    addElementStyle(...)
  }

  function addElementStyle(...) {
    const api = options.domAPI(options); // styleDomAPI.js

    api.update(obj);

    ...
  }
  ```

  ```js
  // styleDomAPI.js
  function domAPI(options) {
    const styleElement = options.insertStyleElement(options);

    return {
        update: (obj) => {
            apply(styleElement, options, obj);
        },
        remove: () => {
            removeStyleElement(styleElement);
        },
    };
  }
  
  function apply(...) {
    ...
    options.styleTagTransform(css, styleElement, options.options);  // styleTagTransform.js
    
  }
  ```

  ```js
  // styleTagTransform.js
  function styleTagTransform(css, styleElement) {
    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = css;
    } else {
        while (styleElement.firstChild) {
        styleElement.removeChild(styleElement.firstChild);
        }

        styleElement.appendChild(document.createTextNode(css));
    }
  }
  ```
  * ##### css-loader
  ```js
  module.exports = async function loader (content) {
    const callback = this.async();
    // 根据options处理plugins
    const plugins = [];
    ...
    plugins.push(...)

    // 使用postcss处理css text
    result = await postcss(plugins).process(content, {...});


    const importCode = getImportCode(...);

    const moduleCode = getModuleCode(result, api, replacements, options, this);

    const exportCode = getExportCode(...);

    callback(null, `${importCode}${moduleCode}${exportCode}`);
  }
  ```
  ```js
  // 模块到处内容为：
  // Imports
  import ___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___ from "../node_modules/css-loader/dist/runtime/noSourceMaps.js";
  import ___CSS_LOADER_API_IMPORT___ from "../node_modules/css-loader/dist/runtime/api.js";
  var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___);
  
  // Module
  ___CSS_LOADER_EXPORT___.push([
    module.id, 
    "body {\n    color: red;\n}\n\nh1 {\n    background-color: yellow;\n}", 
    ""]);
  
  // Exports
  export default ___CSS_LOADER_EXPORT___;
  ```
  > 上面导出的内容，实际上为一个数组（style-loader中对于css的处理也可以看出）
  该数组由`___CSS_LOADER_API_IMPORT___`函数返回，参数为`___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___`
  ```js
  // ___CSS_LOADER_API_IMPORT___
  module.exports = function (cssWithMappingToString) {
    var list = [];

    list.toString = function toString () {
      ...
    }

    list.i = function () {
      ...
    }

    // 上面代码中的___CSS_LOADER_EXPORT___
    return list;
  }
  ```
  ```js
  // utils.js
  // 上面代码中的___CSS_LOADER_EXPORT___数组元素的来源
  function getModuleCode(result, api, replacements, options, loaderContext) {
    if (options.modules.exportOnlyLocals === true) {
      return "";
    }
  
    let sourceMapValue = "";
  
    if (options.sourceMap) {
      const sourceMap = result.map;
  
      sourceMapValue = `,${normalizeSourceMapForRuntime(
        sourceMap,
        loaderContext
      )}`;
    }
  
    let code = JSON.stringify(result.css);
  
    ...
    
    // Indexes description:
    // 0 - module id
    // 1 - CSS code
    // 2 - media
    // 3 - source map
    // 4 - supports
    // 5 - layer
    return `${beforeCode}// Module\n___CSS_LOADER_EXPORT___.push([module.id, ${code}, ""${sourceMapValue}]);\n`;
  }
  ```
* ### 自定义Loader
  * ##### [pdf loader](https://advancedweb.hu/how-to-write-a-webpack-loader/)
    * customized-loader
      1. 功能说明
      > import pdf文件，作为img插入到页面中
      2. 初始化工程
      ```sh
      yarn init -y
      yarn add webpack webpack-cli
      ```
      3. 创建文件夹`src`, `loader`和文件`webpack.config.js`, `src/index.js`, `loader/pdf2pic-loader.js`
      4. 创建文件夹`assets`并拷贝测试文件`xxx.pdf`
      5. 逐个文件编写基础内容
         1. webpac.config.js
         2. loader/pdf2pic-loader.js
         3. src/index.js
      6. 实现loader
         1. 设置raw模式
         2. 转换pdf为img（pdf2pic, pdf-to-png-converter）
          > 使用pdf2pic时，该库需要在底层调用其他的应用([GraphicsMagick](https://github.com/yakovmeister/pdf2image/blob/master/docs/gm-installation.md))来进行转换, 所以需要提前安装,否则会报错。错误如下：

          > Error: Could not execute GraphicsMagick/ImageMagick: gm "convert" "-density" "100x100" "-quality" "75" "-[0]" "-resize" "600x600!" "-compress" "jpeg" "./images/untitled.1.png" this most likely means the gm/convert binaries can't be found
         3. 拷贝 + 返回引用路径
         4. index.js中使用
         5. 每页一个图片的实现

  * ##### [markdown loader](https://glebbahmutov.com/blog/writing-webpack-loader/)
    1. 功能说明
    2. 初始化工程
    3. 创建文件夹`src`, `loader`和文件`webpack.config.js`, `src/index.js`, `loader/pdf2pic-loader.js`
    4. 创建文件夹`assets`并拷贝测试文件`xxx.md`
    5. 逐个文件编写基础内容
         1. webpac.config.js
         2. loader/pdf2pic-loader.js
         3. src/index.js
    6. 实现loader
    * raw-loader
    * markdown-loader + html-loaders
    * customized-loader
  * ##### [mp3 loader](https://redd.one/blog/writing-custom-webpack-loader)