import { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../stories/**/*.(story|stories).@(tsx)'],
    addons: ['@storybook/addon-essentials'],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    docs: {
        autodocs: true,
    },
    // Storybook config
    webpackFinal: async (config, { configType }) => {
        config.resolve = {
            ...config.resolve,
            fallback: {
                ...(config.resolve || {}).fallback,
                fs: false,
                path: false,
            },
        };
        return config;
    },
};

export default config;
