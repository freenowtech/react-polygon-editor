require('jest-styled-components');
require('@testing-library/jest-dom');
import geojsonhint from '@mapbox/geojsonhint';

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
            precisionWarning: false,
        });

        const formattedErrors = errors.map((error) => `line ${error.line}: ${error.message}\n`);

        return {
            pass: errors.length === 0,
            message: () => `Expected GeoJSON to be valid but has the following errors:\n${formattedErrors}\n`,
        };
    },
});
