import { useReducer, useEffect, useMemo, useCallback } from 'react';
import { Coordinate } from 'types';

import { actions } from './actions';
import { ensurePolygonList, isPolygonClosed } from '../helpers';
import { polygonEditReducer, initialState } from './reducer';
import { isValidPolygon } from './validators';

export const usePolygonEditor = (
    onChange: (polygon: Coordinate[], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    highlighted: number
) => {
    const [state, dispatch] = useReducer(polygonEditReducer, initialState, init => {
        return {
            ...init,
            activeIndex: highlighted,
            polygons: ensurePolygonList(polygons)
        };
    });

    const activePolygon = useMemo(() => state.polygons[state.activeIndex], [state.polygons, state.activeIndex]);
    const polygonIsClosed: boolean = useMemo(() => isPolygonClosed(activePolygon), [activePolygon]);

    useEffect(() => {
        if (onChange) {
            onChange(activePolygon, isValidPolygon(activePolygon));
        }
    }, [activePolygon]);

    const addPoint = useCallback((coordinate: Coordinate) => {
        dispatch(actions.addPoint(coordinate));
    }, []);

    const addPointToEdge = useCallback((coordinate: Coordinate, index: number) => {
        dispatch(actions.addPointToEdge(coordinate, index));
    }, []);

    const deselectAllPoints = useCallback(() => {
        dispatch(actions.deselectAllPoints());
    }, []);

    const removePointFromSelection = useCallback((index: number) => {
        dispatch(actions.removePointFromSelection(index));
    }, []);

    const addPointsToSelection = useCallback((indices: number[]) => {
        dispatch(actions.addPointsToSelection(indices));
    }, []);

    const selectPoints = useCallback((indices: number[]) => {
        dispatch(actions.selectPoints(indices));
    }, []);

    const moveSelectedPoints = useCallback((movement: Coordinate) => {
        dispatch(actions.moveSelectedPoints(movement));
    }, []);

    const deletePolygonPoints = useCallback(() => {
        dispatch(actions.deletePolygonPoints());
    }, []);

    const selectAllPoints = useCallback(() => {
        dispatch(actions.selectAllPoints());
    }, []);

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
