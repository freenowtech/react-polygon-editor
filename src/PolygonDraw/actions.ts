import { createAction, createActionWithPayload } from '../actionUtils';
import { ActionsUnion, Coordinate } from '../types';

// Selection actions
export const SELECT_POINTS = 'POLYGON_DRAW/SELECT_POINTS';
export const ADD_POINT_TO_SELECTION = 'POLYGON_DRAW/ADD_POINT_TO_SELECTION';
export const REMOVE_POINT_FROM_SELECTION = 'POLYGON_DRAW/REMOVE_POINT_FROM_SELECTION';
export const SELECT_ALL_POINTS = 'POLYGON_DRAW/SELECT_ALL_POINTS';
export const DESELECT_ALL_POINTS = 'POLYGON_DRAW/DESELECT_ALL_POINTS';

// Delete action
export const DELETE_POLYGON_POINTS = 'POLYGON_DRAW/DELETE_POLYGON_POINTS';

// Move action
export const MOVE_SELECTED_POINTS = 'POLYGON_DRAW/MOVE_SELECTED_POINTS';

// Add point actions
export const ADD_POINT = 'POLYGON_DRAW/ADD_POINT';
export const ADD_POINT_TO_EDGE = 'POLYGON_DRAW/ADD_POINT_TO_EDGE';

// Change polygon actions
export const CHANGE_POLYGON = 'POLYGON_DRAW/CHANGE_POLYGON';
export const SET_POLYGON = 'POLYGON_DRAW/SET_POLYGON';

export const actions = {
    // Selections action creators
    selectPoints: (indices: number[]) => createActionWithPayload(SELECT_POINTS, indices),
    addPointsToSelection: (indices: number[]) => createActionWithPayload(ADD_POINT_TO_SELECTION, indices),
    removePointFromSelection: (index: number) => createActionWithPayload(REMOVE_POINT_FROM_SELECTION, index),
    selectAllPoints: () => createAction(SELECT_ALL_POINTS),
    deselectAllPoints: () => createAction(DESELECT_ALL_POINTS),

    // Move action creator
    moveSelectedPoints: (movement: Coordinate) => createActionWithPayload(MOVE_SELECTED_POINTS, movement),

    // Add point action creator
    addPoint: (coordinate: Coordinate) => createActionWithPayload(ADD_POINT, coordinate),
    addPointToEdge: (coordinate: Coordinate, index: number) =>
        createActionWithPayload(ADD_POINT_TO_EDGE, { coordinate, index }),

    // Delete action creator
    deletePolygonPoints: () => createAction(DELETE_POLYGON_POINTS),

    // Change Polygon
    changePolygon: (polygon: Coordinate[][]) => createActionWithPayload(CHANGE_POLYGON, polygon),
    setPolygon: (polygon: Coordinate[]) => createActionWithPayload(SET_POLYGON, polygon),
};

export type Actions = ActionsUnion<typeof actions>;
