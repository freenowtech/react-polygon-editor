module.exports = {
    verbose: true,
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    moduleNameMapper: {
        '^~(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!**/node_modules/**',
        '!**/*.d.ts'
    ],
    roots: ['<rootDir>/src'],
    collectCoverageFrom: [
        'src/modules/**/*.{ts,tsx}',
        '!**/node_modules/**'
    ],
};
