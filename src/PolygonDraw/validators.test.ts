import { MOCK_POLYGON } from '../mockPolygon';
import { isValidPolygon } from './validators';

describe('isValidPolygon', () => {
    it('should emit false if the polygon has less than points', () => {
        expect(isValidPolygon(MOCK_POLYGON.slice(0, 3))).toBeFalsy();
    });

    it('should emit false if the polygon is not closed', () => {
        expect(isValidPolygon(MOCK_POLYGON.slice(0, 10))).toBeFalsy();
    });

    it('should emit true if the polygon is closed and has more than 3 points', () => {
        expect(isValidPolygon(MOCK_POLYGON)).toBeTruthy();
    });
});
