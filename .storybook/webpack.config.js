const path = require('path');
module.exports = ({ config }) => {
    config.module.rules.push(
        {
            test: /\.story\.(ts|tsx)$/,
            include: [path.resolve(__dirname, '../stories')],
            enforce: 'pre',
            use: [
                {
                    loader: require.resolve('@storybook/addon-storysource/loader'),
                    options: {
                        parser: 'typescript',
                        prettierConfig: {
                            printWidth: 150,
                            tabWidth: 4,
                            singleQuote: true
                        }
                    }
                }
            ]
        },
        {
            test: /\.(ts|tsx)$/,
            include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../stories')],
            enforce: 'pre',
            use: [
                {
                    loader: 'tslint-loader'
                }
            ]
        },
        {
            test: /\.(ts|tsx)$/,
            include: [path.resolve(__dirname, '../src'), path.resolve(__dirname, '../stories')],
            use: [
                {
                    loader: require.resolve('awesome-typescript-loader')
                }
            ]
        }
    );
    config.resolve.extensions.push('.ts', '.tsx');
    config.node = {
        ...config.node,
        fs: 'empty'
    };
    return config;
};
