module.exports = {
    addons: ["@storybook/addon-essentials"],
    framework: '@storybook/react',
    stories: ['../stories/**/*.story.@(tsx)'],
    core: {
        builder: 'webpack5',
    },
};