const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    pluginOptions: {
        electronBuilder: {
            externals: ['electron'],
            nodeIntegration: true,
            contextIsolation: false,
            builderOptions: {
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
