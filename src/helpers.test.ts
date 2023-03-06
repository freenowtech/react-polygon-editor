import { MAP } from './constants';
import {
    addCoordinates,
    getCenterCoordinate,
    isClosingPointsSelected,
    isCoordinateInPolygon,
    isPolygonClosed,
    movePolygonCoordinates,
    removeSelectedPoints,
    ensurePolygonList,
} from './helpers';
import { MOCK_POLYGON, POLYGON_ONE, POLYGON_TWO, POLYGON_THREE } from './mockPolygon';
import { Coordinate } from './types';

describe('helpers', () => {
    describe('isPolygonClosed', () => {
        it('should emit false if the polygon has less than 3 points', () => {
            expect(isPolygonClosed([MOCK_POLYGON[0], MOCK_POLYGON[0]])).toBeFalsy();
        });

        it('should emit false if the first and last point are not equal', () => {
            expect(isPolygonClosed(MOCK_POLYGON.slice(3))).toBeFalsy();
        });

        it('should emit true if the first and last point are equal', () => {
            // this would be a polyline
            expect(isPolygonClosed([MOCK_POLYGON[0], MOCK_POLYGON[1], MOCK_POLYGON[0]])).toBeTruthy();
        });

        it('should emit true if the polygon is closed', () => {
            expect(isPolygonClosed(MOCK_POLYGON)).toBeTruthy();
        });
    });

    describe('isClosingPointsSelected', () => {
        it('should emit false if polygon is open', () => {
            expect(isClosingPointsSelected(MOCK_POLYGON.slice(3), new Set([0, 1]))).toBeFalsy();
        });

        it('should emit false if closing points are not selected', () => {
            expect(isClosingPointsSelected(MOCK_POLYGON, new Set([3, 4]))).toBeFalsy();
        });

        it('should emit true if closing points are selected', () => {
            expect(isClosingPointsSelected(MOCK_POLYGON, new Set([0, 4]))).toBeTruthy();
        });
    });

    describe('isCoordinateInPolygon', () => {
        it('should emit false if point is outside polygon', () => {
            expect(isCoordinateInPolygon(MAP.WORLD_COORDINATES[0], MOCK_POLYGON)).toBeFalsy();
        });

        it('should emit false if point is on the edge of the polygon', () => {
            expect(isCoordinateInPolygon(MOCK_POLYGON[0], MOCK_POLYGON)).toBeFalsy();
        });

        it('should emit true if point is inside the polygon', () => {
            expect(
                isCoordinateInPolygon(
                    getCenterCoordinate(MOCK_POLYGON[0], MOCK_POLYGON[MOCK_POLYGON.length / 2]),
                    MOCK_POLYGON
                )
            ).toBeTruthy();
        });
    });

    describe('movePolygonCoordinates', () => {
        const MOVE_VECTOR: Coordinate = {
            longitude: 0.1,
            latitude: 0.1,
        };

        it('should move selected points', () => {
            const movedPolygon = movePolygonCoordinates(MOCK_POLYGON, new Set([5]), MOVE_VECTOR);
            expect(movedPolygon[5]).toEqual(addCoordinates(MOCK_POLYGON[5], MOVE_VECTOR));
            expect(
                movedPolygon.every((coordinate, index) => index === 5 || coordinate === MOCK_POLYGON[index])
            ).toBeTruthy();
        });

        describe('WHEN one closing point is selected', () => {
            it('should move both closing points', () => {
                const movedPolygon = movePolygonCoordinates(MOCK_POLYGON, new Set([0, 5]), MOVE_VECTOR);
                expect(movedPolygon[0]).toEqual(addCoordinates(MOCK_POLYGON[0], MOVE_VECTOR));
                expect(movedPolygon[MOCK_POLYGON.length - 1]).toEqual(
                    addCoordinates(MOCK_POLYGON[MOCK_POLYGON.length - 1], MOVE_VECTOR)
                );
            });
        });
    });

    describe('removeSelectedPoints', () => {
        const SMALL_POYLGON = [MOCK_POLYGON[0], MOCK_POLYGON[1], MOCK_POLYGON[2], MOCK_POLYGON[3], MOCK_POLYGON[0]];
        it('should remove selected points ', () => {
            expect(removeSelectedPoints(SMALL_POYLGON, new Set<number>([1]))).toEqual([
                SMALL_POYLGON[0],
                SMALL_POYLGON[2],
                SMALL_POYLGON[3],
                SMALL_POYLGON[0],
            ]);
        });

        it('should open the polygon if less than 4 points are left', () => {
            expect(removeSelectedPoints(SMALL_POYLGON, new Set<number>([1, 2]))).toEqual([
                SMALL_POYLGON[3],
                SMALL_POYLGON[0],
            ]);
        });

        it('should remove both edge points if one was selected', () => {
            expect(removeSelectedPoints(SMALL_POYLGON, new Set<number>([0, 1]))).toEqual([
                SMALL_POYLGON[2],
                SMALL_POYLGON[3],
            ]);
        });
    });

    describe('ensurePolygonList', () => {
        it('should return a list of polygons from a single polygon', () => {
            expect(ensurePolygonList(MOCK_POLYGON)).toStrictEqual([MOCK_POLYGON]);
        });

        it('should return a list of polygons from multiple polygons', () => {
            const polygons: Coordinate[][] = [[...POLYGON_ONE], [...POLYGON_TWO], [...POLYGON_THREE]];
            expect(ensurePolygonList(polygons)).toStrictEqual([POLYGON_ONE, POLYGON_TWO, POLYGON_THREE]);
        });

        it('should return an empty list of polygons from an empty polygon', () => {
            const polygon: Coordinate[] = [];
            expect(ensurePolygonList(polygon)).toStrictEqual([[]]);
        });
    });
});
