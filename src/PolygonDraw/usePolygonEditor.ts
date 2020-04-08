import { useMemo, useState } from 'react';
import { Coordinate } from 'types';
import isEqual from 'lodash.isequal';

import { Actions, actions } from './actions';
import { ensurePolygonList, isPolygonClosed, isPolygonList } from '../helpers';
import { PolygonEditState, undoablePolygonEditReducer } from './reducer';
import { isValidPolygon } from './validators';
import { ActionCreators, StateWithHistory } from 'redux-undo';

export const usePolygonEditor = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    activeIndex: number
) => {
    const polygonList = ensurePolygonList(polygons);

    const [selection, setSelection] = useState<Set<number>>(new Set());
    const [editHistory, setEditHistory] = useState<Omit<StateWithHistory<PolygonEditState>, 'present'>>({
        past: [],
        future: []
    });

    const state: StateWithHistory<PolygonEditState> = {
        present: {
            polygons: polygonList,
            activeIndex: activeIndex,
            selection: selection
        },
        ...editHistory
    };

    const dispatch = (action: Actions) => {
        const { present: { polygons: newPolygons, selection: newSelection }, ...rest } = undoablePolygonEditReducer(state, action);
        setEditHistory(rest);
        if (!isEqual(selection, newSelection)) {
            setSelection(newSelection);
        }
        onChange(isPolygonList(polygons) ? newPolygons : newPolygons[0], newPolygons.every(isValidPolygon));
    };

    const activePolygon = useMemo(() => state.present.polygons[state.present.activeIndex], [state.present.polygons, state.present.activeIndex]);
    const polygonIsClosed: boolean = useMemo(() => isPolygonClosed(activePolygon), [activePolygon]);

    const setPolygon = (polygon: Coordinate[]) => {
        dispatch(actions.setPolygon(polygon));
    };

    const addPoint = (coordinate: Coordinate) => {
        dispatch(actions.addPoint(coordinate));
    };

    const addPointToEdge = (coordinate: Coordinate, index: number) => {
        dispatch(actions.addPointToEdge(coordinate, index));
    };

    const deselectAllPoints = () => {
        dispatch(actions.deselectAllPoints());
    };

    const removePointFromSelection = (index: number) => {
        dispatch(actions.removePointFromSelection(index));
    };

    const addPointsToSelection = (indices: number[]) => {
        dispatch(actions.addPointsToSelection(indices));
    };

    const selectPoints = (indices: number[]) => {
        dispatch(actions.selectPoints(indices));
    };

    const moveSelectedPoints = (movement: Coordinate) => {
        dispatch(actions.moveSelectedPoints(movement));
    };

    const deletePolygonPoints = () => {
        dispatch(actions.deletePolygonPoints());
    };

    const selectAllPoints = () => {
        dispatch(actions.selectAllPoints());
    };

    const undo = () => {
        dispatch(ActionCreators.undo());
    };

    const redo = () => {
        dispatch(ActionCreators.redo());
    };

    return {
        selection: state.present.selection,
        polygons: state.present.polygons,
        isPolygonClosed: polygonIsClosed,
        addPoint,
        addPointToEdge,
        deselectAllPoints,
        removePointFromSelection,
        addPointsToSelection,
        selectPoints,
        moveSelectedPoints,
        deletePolygonPoints,
        selectAllPoints,
        setPolygon,
        undo,
        redo
    };
};
