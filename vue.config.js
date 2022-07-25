const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        experiments: {
            topLevelAwait: true,
        },
    },
    pluginOptions: {
        electronBuilder: {
            externals: ['electron'],
            nodeIntegration: true,
            contextIsolation: false,
            builderOptions: {
                productName: 'Snowball',
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
            },
        },
    },
});
