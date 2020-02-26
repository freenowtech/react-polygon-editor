import 'jest-styled-components';
import '@testing-library/jest-dom';
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
import geojsonhint from '@mapbox/geojsonhint';

Enzyme.configure({ adapter: new Adapter() });

declare global {
    namespace jest {
        interface Matchers<R, T> {
            toBeValidGeoJSON(): R;
        }
    }
}

expect.extend({
    toBeValidGeoJSON(testee: string): jest.CustomMatcherResult {
        const errors = geojsonhint.hint(testee, {
            precisionWarning: false
        });

        const formattedErrors = errors.map(error => `line ${error.line}: ${error.message}\n`);

        return {
            pass: errors.length === 0,
            message: () => (
                `Expected GeoJSON to be valid but has the following errors:\n` +
                `${formattedErrors}\n`
            )
        };
    }
});
