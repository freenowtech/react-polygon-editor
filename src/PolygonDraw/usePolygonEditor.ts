import { useMemo, useState } from 'react';
import { Coordinate } from 'types';
import isEqual from 'lodash.isequal';

import { Actions, actions } from './actions';
import { ensurePolygonList, isPolygonClosed, isPolygonList } from '../helpers';
import { polygonEditReducer, PolygonEditState } from './reducer';
import { isValidPolygon } from './validators';

export const usePolygonEditor = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    activeIndex: number
) => {
    const polygonList = ensurePolygonList(polygons);

    const [selection, setSelection] = useState<Set<number>>(new Set());

    const state: PolygonEditState = {
        polygons: polygonList,
        activeIndex: activeIndex,
        selection: selection
    };

    const dispatch = (action: Actions) => {
        const { polygons: newPolygons, selection: newSelection } = polygonEditReducer(state, action);
        if (!isEqual(selection, newSelection)) {
            setSelection(newSelection);
        }
        onChange(
            isPolygonList(polygons) ? newPolygons : newPolygons[0], newPolygons.every(isValidPolygon)
        );
    };

    const activePolygon = useMemo(() => state.polygons[state.activeIndex], [state.polygons, state.activeIndex]);
    const polygonIsClosed: boolean = useMemo(() => isPolygonClosed(activePolygon), [activePolygon]);

    polygonEditReducer(state, (actions.changePolygon(polygonList)));

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

    return {
        selection: state.selection,
        polygons: state.polygons,
        isPolygonClosed: polygonIsClosed,
        addPoint,
        addPointToEdge,
        deselectAllPoints,
        removePointFromSelection,
        addPointsToSelection,
        selectPoints,
        moveSelectedPoints,
        deletePolygonPoints,
        selectAllPoints
    };
};
