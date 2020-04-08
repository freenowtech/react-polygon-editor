import { ActionCreators, newHistory } from 'redux-undo';
import { getCenterCoordinate, movePolygonCoordinates, removeSelectedPoints } from '../helpers';
import { EDIT_HISTORY_LIMIT, polygonEditReducer, PolygonEditState, undoablePolygonEditReducer } from './reducer';
import { actions } from './actions';
import { MOCK_POLYGON, POLYGON_ONE, POLYGON_TWO, POLYGON_THREE } from '../mockPolygon';
import { Coordinate } from '../types';

describe('PolygonDraw reducer', () => {
    const initialState: PolygonEditState = {
        activeIndex: 0,
        polygons: [[]],
        selection: new Set()
    };

    describe('changePolygon', () => {
        it('should change single polygon', () => {
            const action = actions.changePolygon([MOCK_POLYGON]);
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set()
            };
            expect(polygonEditReducer(initialState, action)).toEqual(expectedState);
        });

        it('should change multiple polygons', () => {
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set()
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [POLYGON_ONE, POLYGON_TWO, POLYGON_THREE],
                selection: new Set()
            };
            expect(polygonEditReducer(state, actions.changePolygon([POLYGON_ONE, POLYGON_TWO, POLYGON_THREE]))).toEqual(
                expectedState
            );
        });
    });

    describe('set polygon', () => {
        it('should replace the active polygon', () => {
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [POLYGON_ONE],
                selection: new Set()
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [POLYGON_TWO],
                selection: new Set()
            };
            expect(polygonEditReducer(state, actions.setPolygon(POLYGON_TWO))).toEqual(expectedState);
        });

        it('should remove any existing selection', () => {
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [POLYGON_ONE],
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [POLYGON_TWO],
                selection: new Set()
            };
            expect(polygonEditReducer(state, actions.setPolygon(POLYGON_TWO))).toEqual(expectedState);
        });
    });

    describe('Move points', () => {
        it('should move selected points', () => {
            const action = actions.moveSelectedPoints({ longitude: 0.1, latitude: 0.2 });
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set([0, 1])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [movePolygonCoordinates(MOCK_POLYGON, state.selection, action.payload)],
                selection: state.selection
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Select points', () => {
        it('should select provied points', () => {
            const action = actions.selectPoints([0, 1, 2]);
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [[]],
                selection: new Set([0, 1, 2])
            };
            expect(polygonEditReducer(initialState, action)).toEqual(expectedState);
        });

        it('should add the provided points to selection', () => {
            const action = actions.addPointsToSelection([3]);
            const state = {
                ...initialState,
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [[]],
                selection: new Set([0, 1, 2, 3])
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
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
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should select all points', () => {
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set(Array.from({ length: MOCK_POLYGON.length }, (_, index) => index))
            };
            expect(polygonEditReducer(state, actions.selectAllPoints())).toEqual(expectedState);
        });

        it('should deselect all points', () => {
            const action = actions.deselectAllPoints();
            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set([0, 1, 2])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set()
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Delete points', () => {
        it('should remove selected points from polygon', () => {
            const action = actions.deletePolygonPoints();

            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [MOCK_POLYGON],
                selection: new Set([0])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [removeSelectedPoints(state.polygons[0], state.selection)],
                selection: new Set()
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });
    });

    describe('Add point', () => {
        it('should add point to polygon and select it', () => {
            const action = actions.addPoint(MOCK_POLYGON[1]);

            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [[MOCK_POLYGON[0]]],
                selection: new Set([0])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [[MOCK_POLYGON[0], MOCK_POLYGON[1]]],
                selection: new Set([1])
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });

        it('should add point to the provided polygon edge and select it', () => {
            const newPoint = getCenterCoordinate(MOCK_POLYGON[0], MOCK_POLYGON[1]);
            const action = actions.addPointToEdge(newPoint, 0);

            const state: PolygonEditState = {
                activeIndex: 0,
                polygons: [[MOCK_POLYGON[0], MOCK_POLYGON[1]]],
                selection: new Set([1])
            };
            const expectedState: PolygonEditState = {
                activeIndex: 0,
                polygons: [[MOCK_POLYGON[0], newPoint, MOCK_POLYGON[1]]],
                selection: new Set([0])
            };
            expect(polygonEditReducer(state, action)).toEqual(expectedState);
        });
    });
});

describe('Undoable PolygonDraw reducer', () => {
    it('should aggregate to one undoable action', () => {
        const initialState: PolygonEditState = {
            activeIndex: 0,
            polygons: [MOCK_POLYGON],
            selection: new Set([0])
        };
        const initialStateWithHistory = newHistory([], initialState, []);

        const coordinates: Coordinate[] = [{
            latitude: 1,
            longitude: 1
        }, {
            latitude: 2,
            longitude: 2
        }, {
            latitude: 3,
            longitude: 3
        }];

        const stateAfterMoving = coordinates.reduce((prev, next) => {
            return undoablePolygonEditReducer(prev, actions.moveSelectedPoints(next));
        }, initialStateWithHistory);

        const stateAfterUndo = undoablePolygonEditReducer(stateAfterMoving, ActionCreators.undo());

        expect(stateAfterUndo.present).toEqual(initialState);
    });

    it('should undo multiple actions', () => {
        const initialState: PolygonEditState = {
            activeIndex: 0,
            polygons: [MOCK_POLYGON],
            selection: new Set([0])
        };
        const initialStateWithHistory = newHistory([], initialState, []);

        const coordinates: Coordinate[] = [{
            latitude: 1,
            longitude: 1
        }, {
            latitude: 2,
            longitude: 2
        }, {
            latitude: 3,
            longitude: 3
        }];

        const stateAfterMoving = coordinates.reduce((prev, next) => {
            return undoablePolygonEditReducer(prev, actions.moveSelectedPoints(next));
        }, initialStateWithHistory);

        const stateAfterAddingNewPoint = undoablePolygonEditReducer(stateAfterMoving, actions.addPoint({ latitude: 4, longitude: 4 }));

        const stateAfterUndo = undoablePolygonEditReducer(stateAfterAddingNewPoint, ActionCreators.undo());
        expect(stateAfterUndo.present).toEqual(stateAfterMoving.present);

        const stateAfterSecondUndo = undoablePolygonEditReducer(stateAfterUndo, ActionCreators.undo());
        expect(stateAfterSecondUndo.present).toEqual(initialState);
    });

    it('shouldn\'t undo irrelevant actions', () => {
        const initialState: PolygonEditState = {
            activeIndex: 0,
            polygons: [MOCK_POLYGON],
            selection: new Set([0])
        };
        const initialStateWithHistory = newHistory([], initialState, []);

        const stateAfterAddingNewPoint = undoablePolygonEditReducer(initialStateWithHistory, actions.addPoint({ latitude: 4, longitude: 4 }));
        const stateAfterSelectingAllPoints = undoablePolygonEditReducer(stateAfterAddingNewPoint, actions.selectAllPoints());

        const stateAfterUndo = undoablePolygonEditReducer(stateAfterSelectingAllPoints, ActionCreators.undo());
        expect(stateAfterUndo.present).toEqual(initialState);
    });

    it(`should limit undoable actions to ${EDIT_HISTORY_LIMIT}`, () => {
        const initialState: PolygonEditState = {
            activeIndex: 0,
            polygons: [MOCK_POLYGON],
            selection: new Set([0])
        };
        const initialStateWithHistory = newHistory([], initialState, []);

        const stateAfterFirstChange = undoablePolygonEditReducer(initialStateWithHistory, actions.addPoint({ latitude: 50, longitude: 50 }));

        let inbetweenState = stateAfterFirstChange;
        for (let i = 0; i < EDIT_HISTORY_LIMIT; i++) {
            inbetweenState = undoablePolygonEditReducer(inbetweenState, actions.addPoint({ latitude: i, longitude: i }));
        }

        for (let i = 0; i < EDIT_HISTORY_LIMIT + 1; i++) {
            inbetweenState = undoablePolygonEditReducer(inbetweenState, ActionCreators.undo());
        }

        expect(inbetweenState.present).toEqual(stateAfterFirstChange.present);
    });
});
