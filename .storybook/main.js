module.exports = {
    addons: ["@storybook/addon-essentials"],
    framework: '@storybook/react',
    stories: ['../stories/**/*.story.@(tsx)'],
    core: {
        builder: 'webpack5',
    },
    webpackFinal: (config) => {
        config.resolve.fallback = { path: false, fs: false }
        return config;
    },
};