module.exports = {
    testURL: 'http://localhost/', // https://github.com/facebook/jest/issues/6766#issuecomment-408344243
    testRegex: ".*\.(test|spec)\.(jsx?|tsx?)$",
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
        '!**/*.d.ts'
    ],
    setupFilesAfterEnv: ['<rootDir>/env-setup.js'],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json'
        }
    },
    roots: [
        '<rootDir>/src'
    ],
    preset: 'ts-jest/presets/js-with-ts',
    testRegex: '.*\.(test|spec)\.(ts?|tsx?)$',
    collectCoverageFrom: [
        'src/modules/**/*.{ts,tsx}',
        '!**/node_modules/**'
    ],
    snapshotSerializers: ['enzyme-to-json/serializer']
};
