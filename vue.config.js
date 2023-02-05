const { defineConfig } = require('@vue/cli-service');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        experiments: {
            topLevelAwait: true,
        },
        plugins: [
            // fix "process is not defined" error:
            // (do "npm install process" before running the build)
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
        ],
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['electron'],
            nodeIntegration: true,
            contextIsolation: false,
            builderOptions: {
                productName: 'Snowball',
                appId: 'design.shengchen.snowball',
                fileAssociations: [
                    {
                        ext: 'snowball',
                        name: 'Snowball Project',
                        description: 'Literature review project created with Snowball.',
                        role: 'Editor',
                        icon: 'document.icns',
                        isPackage: true,
                    },
                ],
                afterSign: 'electron-builder-notarize',
                mac: {
                    hardenedRuntime: true,
                    entitlements: './node_modules/electron-builder-notarize/entitlements.mac.inherit.plist',
                },
            },
        },
    },
});
