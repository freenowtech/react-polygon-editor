import undoable, { excludeAction } from 'redux-undo';

import {
    Actions,
    SELECT_POINTS,
    ADD_POINT_TO_SELECTION,
    REMOVE_POINT_FROM_SELECTION,
    DESELECT_ALL_POINTS,
    SELECT_ALL_POINTS,
    MOVE_SELECTED_POINTS,
    DELETE_POLYGON_POINTS,
    ADD_POINT,
    ADD_POINT_TO_EDGE,
    CHANGE_POLYGON,
    SET_POLYGON,
} from './actions';
import { Coordinate } from 'types';

import { ensurePolygonList, movePolygonCoordinates, removeSelectedPoints } from '../helpers';

export interface PolygonEditState {
    activeIndex: number;
    polygons: Coordinate[][];
    selection: Set<number>;
}

export const polygonEditReducer = (state: PolygonEditState, action: Actions): PolygonEditState => {
    switch (action.type) {
        ///////////////////////////////////////////////////////////////////////////////////
        ///                            CHANGE POLYGON CASES                             ///
        ///////////////////////////////////////////////////////////////////////////////////
        case CHANGE_POLYGON: {
            return {
                ...state,
                polygons: [...action.payload],
            };
        }
        case SET_POLYGON: {
            return {
                ...state,
                polygons: [
                    ...state.polygons.slice(0, state.activeIndex),
                    action.payload,
                    ...state.polygons.slice(state.activeIndex + 1),
                ],
                selection: new Set(),
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                            MOVE COORDINATES CASES                           ///
        ///////////////////////////////////////////////////////////////////////////////////
        case MOVE_SELECTED_POINTS: {
            return {
                ...state,
                polygons: [
                    ...state.polygons.slice(0, state.activeIndex),
                    movePolygonCoordinates(state.polygons[state.activeIndex], state.selection, action.payload),
                    ...state.polygons.slice(state.activeIndex + 1),
                ],
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              SELECTION POINTS CASES                                ///
        ///////////////////////////////////////////////////////////////////////////////////
        case SELECT_POINTS: {
            return {
                ...state,
                selection: new Set(action.payload),
            };
        }
        case ADD_POINT_TO_SELECTION: {
            return {
                ...state,
                selection: new Set([...state.selection.values(), ...action.payload]),
            };
        }
        case REMOVE_POINT_FROM_SELECTION: {
            const selection = new Set(state.selection);
            selection.delete(action.payload);
            return {
                ...state,
                selection,
            };
        }
        case SELECT_ALL_POINTS: {
            return {
                ...state,
                selection: new Set(state.polygons[state.activeIndex].map((_, i) => i)),
            };
        }
        case DESELECT_ALL_POINTS: {
            return {
                ...state,
                selection: new Set(),
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              DELETE POINTS CASE                             ///
        ///////////////////////////////////////////////////////////////////////////////////
        case DELETE_POLYGON_POINTS: {
            return {
                ...state,
                polygons: [
                    ...state.polygons.slice(0, state.activeIndex),
                    removeSelectedPoints(state.polygons[state.activeIndex], state.selection),
                    ...state.polygons.slice(state.activeIndex + 1),
                ],
                selection: new Set(),
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              ADD POINT CASE                                 ///
        ///////////////////////////////////////////////////////////////////////////////////
        case ADD_POINT: {
            console.log({ state })
            const polygonList = ensurePolygonList(state.polygons);
            return {
                ...state,
                polygons: [
                    ...polygonList.slice(0, state.activeIndex),
                    [...polygonList[state.activeIndex], action.payload],
                    ...polygonList.slice(state.activeIndex + 1),
                ],
                selection: new Set([state.polygons.length]),
            };
        }
        case ADD_POINT_TO_EDGE: {
            return {
                ...state,
                polygons: [
                    ...state.polygons.slice(0, state.activeIndex),
                    [
                        ...state.polygons[state.activeIndex].slice(0, action.payload.index + 1),
                        action.payload.coordinate,
                        ...state.polygons[state.activeIndex].slice(action.payload.index + 1),
                    ],
                    ...state.polygons.slice(state.activeIndex + 1),
                ],
                selection: new Set([action.payload.index]),
            };
        }
        default: {
            return state;
        }
    }
};

export const EDIT_HISTORY_LIMIT = 20;

export const undoablePolygonEditReducer = undoable(polygonEditReducer, {
    groupBy: (action, state, history) => {
        if (action.type === MOVE_SELECTED_POINTS) {
            return `${action.type}-${[...state.selection].sort().join('-')}`;
        }
        return null;
    },
    filter: excludeAction([
        SELECT_POINTS,
        ADD_POINT_TO_SELECTION,
        REMOVE_POINT_FROM_SELECTION,
        SELECT_ALL_POINTS,
        DESELECT_ALL_POINTS,
        CHANGE_POLYGON,
    ]),
    // see https://github.com/omnidan/redux-undo/issues/6#issuecomment-142089793
    limit: EDIT_HISTORY_LIMIT + 1,
    debug: false,
    syncFilter: true,
});
