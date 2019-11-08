import { getCenterCoordinate, movePolygonCoordinates, removeSelectedPoints } from '../helpers';
import { initialState, PolygonEditReducer, PolygonEditState } from './reducer';
import { actions } from './actions';
import { MOCK_POLYGON } from '../mockPolygon';

describe('PolygonDraw reducer', () => {
    describe('changePolygon', () => {
        it('should change the polygon', () => {
            const action = actions.changePolygon(MOCK_POLYGON);
            const expectedState: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set()
            };
            expect(PolygonEditReducer(initialState, action)).toEqual(expectedState);
        });
    });

    describe('Move points', () => {
        it('should move selected points', () => {
            const action = actions.moveSelectedPoints({ longitude: 0.1, latitude: 0.2 });
            const state: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set([0, 1])
            };
            const expectedState: PolygonEditState = {
                polygon: movePolygonCoordinates(MOCK_POLYGON, state.selection, action.payload),
                selection: state.selection
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Select points', () => {
        it('should select provied points', () => {
            const action = actions.selectPoints([0, 1, 2]);
            const expectedState: PolygonEditState = {
                polygon: [],
                selection: new Set([0, 1, 2])
            };
            expect(PolygonEditReducer(initialState, action)).toEqual(expectedState);
        });

        it('should add the provided points to selection', () => {
            const action = actions.addPointsToSelection([3]);
            const state = {
                ...initialState,
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                polygon: [],
                selection: new Set([0, 1, 2, 3])
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should remove the provided points from selection', () => {
            const action = actions.removePointFromSelection(0);
            const state = {
                ...initialState,
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                ...initialState,
                selection: new Set([1, 2])
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should select all points', () => {
            const action = actions.selectAllPoints();
            const state: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set(Array.from({ length: MOCK_POLYGON.length}, (_, index) => index))
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should deselect all points', () => {
            const action = actions.deselectAllPoints();
            const state: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set()
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Delete points', () => {
        it('should remove selected points from polygon', () => {
            const action = actions.deletePolygonPoints();

            const state: PolygonEditState = {
                polygon: MOCK_POLYGON,
                selection: new Set([0])
            };
            const expectedState: PolygonEditState = {
                polygon: removeSelectedPoints(state.polygon, state.selection),
                selection: new Set()
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Add point', () => {
        it('should add point to polygon and select it', () => {
            const action = actions.addPoint(MOCK_POLYGON[1]);

            const state: PolygonEditState = {
                polygon: [MOCK_POLYGON[0]],
                selection: new Set([0])
            };
            const expectedState: PolygonEditState = {
                polygon: [MOCK_POLYGON[0], MOCK_POLYGON[1]],
                selection: new Set([1])
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should add point to the provided polygon edge and select it', () => {
            const newPoint = getCenterCoordinate(MOCK_POLYGON[0], MOCK_POLYGON[1]);
            const action = actions.addPointToEdge(newPoint, 0);

            const state: PolygonEditState = {
                polygon: [MOCK_POLYGON[0], MOCK_POLYGON[1]],
                selection: new Set([1])
            };
            const expectedState: PolygonEditState = {
                polygon: [MOCK_POLYGON[0], newPoint, MOCK_POLYGON[1]],
                selection: new Set([0])
            };
            expect(PolygonEditReducer(state, action)).toEqual(expectedState);
        });
    });
});
