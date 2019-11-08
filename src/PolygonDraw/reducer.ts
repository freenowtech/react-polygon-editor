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
    CHANGE_POLYGON
} from './actions';
import { Coordinate } from 'types';

import { movePolygonCoordinates, removeSelectedPoints } from '../helpers';

export interface PolygonEditState {
    polygon: Coordinate[];
    selection: Set<number>;
}

export const initialState: PolygonEditState = {
    polygon: [],
    selection: new Set()
};

export const PolygonEditReducer = (state: PolygonEditState, action: Actions): PolygonEditState => {
    switch (action.type) {
        ///////////////////////////////////////////////////////////////////////////////////
        ///                            CHANGE POLYGON CASES                             ///
        ///////////////////////////////////////////////////////////////////////////////////
        case CHANGE_POLYGON: {
            return { ...state, polygon: action.payload };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                            MOVE COORDINATES CASES                           ///
        ///////////////////////////////////////////////////////////////////////////////////
        case MOVE_SELECTED_POINTS: {
            return {
                ...state,
                polygon: movePolygonCoordinates(state.polygon, state.selection, action.payload)
            };
        }

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              SELECTION CASES                                ///
        ///////////////////////////////////////////////////////////////////////////////////
        case SELECT_POINTS:
            return {
                ...state,
                selection: new Set(action.payload)
            };
        case ADD_POINT_TO_SELECTION:
            return {
                ...state,
                selection: new Set([...state.selection.values(), ...action.payload])
            };
        case REMOVE_POINT_FROM_SELECTION: {
            const selection = new Set(state.selection);
            selection.delete(action.payload);
            return {
                ...state,
                selection
            };
        }
        case SELECT_ALL_POINTS:
            return {
                ...state,
                selection: new Set(state.polygon.keys())
            };
        case DESELECT_ALL_POINTS:
            return {
                ...state,
                selection: new Set()
            };

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              DELETE POINTS CASE                             ///
        ///////////////////////////////////////////////////////////////////////////////////
        case DELETE_POLYGON_POINTS:
            const newPolygonCoordinates = removeSelectedPoints(state.polygon, state.selection);

            return {
                ...state,
                polygon: newPolygonCoordinates,
                selection: new Set()
            };

        ///////////////////////////////////////////////////////////////////////////////////
        ///                              ADD POINT CASE                                 ///
        ///////////////////////////////////////////////////////////////////////////////////
        case ADD_POINT:
            return {
                ...state,
                polygon: [
                    ...state.polygon,
                    action.payload
                ],
                selection: new Set([state.polygon.length])
            };
        case ADD_POINT_TO_EDGE:
            const polygonCoordinates = [
                ...state.polygon.slice(0, action.payload.index + 1),
                action.payload.coordinate,
                ...state.polygon.slice(action.payload.index + 1)
            ];
            return {
                ...state,
                polygon: polygonCoordinates,
                selection: new Set([action.payload.index])
            };
        default:
            return state;
    }
};
