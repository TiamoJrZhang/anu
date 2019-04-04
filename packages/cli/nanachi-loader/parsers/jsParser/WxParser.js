const JavascriptParser = require('./JavascriptParser');

class WxParser extends JavascriptParser{
    constructor(props) {
        super(props);
        this._babelPlugin = {
            configFile: false,
            babelrc: false,
            comments: false,
            ast: true,
            plugins: [
                [require('@babel/plugin-proposal-decorators'), { legacy: true }],
                /**
                 * [babel 6 to 7] 
                 * v6 default config: ["plugin", { "loose": true }]
                 * v7 default config: ["plugin"]
                 */
                [
                    require('@babel/plugin-proposal-class-properties'),
                    { loose: true }
                ],
                require('@babel/plugin-proposal-object-rest-spread'),
                [
                    //重要,import { Xbutton } from 'schnee-ui' //按需引入
                    require('babel-plugin-import').default,
                    {
                        libraryName: 'schnee-ui',
                        libraryDirectory: 'components',
                        camel2DashComponentName: false
                    }
                ],
                require('@babel/plugin-syntax-jsx'),
                require('../../../packages/babelPlugins/collectTitleBarConfig'),
                require('../../../packages/babelPlugins/collectWebViewPage'),
                // require('../../../packages/babelPlugins/collectPatchComponents'), // 不在分析过程中收集是否需要安装补丁组件，分析代码前就确定是否需要安装
                require('../../../packages/babelPlugins/collectDependencies'),
                // ...require('../../../packages/babelPlugins/validateJsx')(this.collectError),
                [require('@babel/plugin-transform-template-literals'), { loose: true }],
                ...require('../../../packages/babelPlugins/transformMiniApp')(this.filepath),
                ...require('../../../packages/babelPlugins/transformEnv'),
                ...require('../../../packages/babelPlugins/injectRegeneratorRuntime'),
                require('../../../packages/babelPlugins/transformIfImport'),
                require('../../../packages/babelPlugins/trasnformAlias')( {sourcePath: this.filepath, platform: this.platform } )
            ]
        };
    }
    async parse() {
        const res = await super.parse();
        this.queues = res.options.anu.queue || this.queues;
        this.queues.push({
            type: 'js',
            path: this.relativePath,
            code: res.code,
            extraModules: res.options.anu.extraModules
        });
    }
}

module.exports = WxParser;