module.exports = [
    {
        path: 'dist/index.js',
        limit: '500 ms',
        // modifying webpack config because jsontlint uses fs and path
        modifyWebpackConfig: (config) => {
            config.resolve = {
                ...config.resolve,
                fallback: {
                    ...(config.resolve || {}).fallback,
                    fs: false,
                    path: false,
                },
            };
            return config;
        }
    },
];
