import { useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { Coordinate } from 'types';
import isEqual from 'lodash.isequal';

import { actions } from './actions';
import { ensurePolygonList, isPolygonClosed } from '../helpers';
import { polygonEditReducer, initialState } from './reducer';
import { isValidPolygon } from './validators';

function usePrevious(value: Coordinate[][]) {
    const ref = useRef<Coordinate[][]>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export const usePolygonEditor = (
    onChange: (polygon: Coordinate[], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    highlighted: number
) => {
    const polygonList = ensurePolygonList(polygons);

    const [state, dispatch] = useReducer(polygonEditReducer, initialState, init => {
        return {
            ...init,
            activeIndex: highlighted,
            polygons: polygonList
        };
    });

    const activePolygon = useMemo(() => state.polygons[state.activeIndex], [state.polygons, state.activeIndex]);
    const polygonIsClosed: boolean = useMemo(() => isPolygonClosed(activePolygon), [activePolygon]);

    const prevPolygons = usePrevious(polygonList);

    useEffect(() => {
        if (!isEqual(prevPolygons, polygonList)) {
            dispatch(actions.changePolygon(polygonList));
        }
    }, [polygonList]);

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
