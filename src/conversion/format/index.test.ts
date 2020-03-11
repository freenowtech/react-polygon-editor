import path from 'path';
import fs from 'fs';

import { FormatType } from './types';
import { format } from '.';

const testdataDir = path.resolve(__dirname, '__testdata__');

type TestCase = [
    string, // name
    'valid' | 'invalid', // state
    string, // path
    FormatType // format
];

describe('conversion format', () => {
    const formats = Object.keys(format);

    const getTestCaseFromFile = (filePath: string): TestCase => {
        const fileName = path.basename(filePath, '.json');
        const [state, formatType, testName] = fileName.split('_');

        if (state !== 'valid' && state !== 'invalid') {
            throw new Error(`test file ${fileName}: must begin with 'valid_' or 'invalid_'`);
        }

        if (formats.every(f => f !== formatType)) {
            throw new Error(`test file ${fileName}: format must be in ${formats}, but was ${formatType}`);
        }

        if (!testName) {
            throw new Error(`test file ${fileName}: format must have a test name`);
        }

        return [testName.replace('-', ' '), state, filePath, formatType as FormatType];
    };

    const getTestCasesForFormat = (f: FormatType): TestCase[] => {
        return fs
            .readdirSync(testdataDir)
            .map(getTestCaseFromFile)
            .filter(testCase => testCase[3] === f);
    };

    describe.each(formats)('%s', (f: FormatType) => {
        const testCases = getTestCasesForFormat(f);

        if (testCases.length > 0) {
            test.each(testCases)('validation: %s => %s', (testName, state, testPath, formatType) => {
                const raw = fs.readFileSync(path.join(testdataDir, testPath)).toString('utf-8');
                const expected = state === 'valid';
                const actual = format[formatType].validate(raw);
                expect(actual).toBe(expected);
            });

            test.each(testCases)('deserialize: %s => %s', (testName, state, testPath, formatType) => {
                const raw = fs.readFileSync(path.join(testdataDir, testPath)).toString('utf-8');
                if (state === 'valid') {
                    expect(format[formatType].deserialize(raw)).toMatchSnapshot();
                } else {
                    expect(() => format[formatType].deserialize(raw)).toThrowErrorMatchingSnapshot();
                }
            });
        }
    });
});
