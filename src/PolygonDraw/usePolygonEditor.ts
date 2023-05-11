import { createUndoRedo } from 'react-undo-redo';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import isEqual from 'lodash.isequal';

import { Coordinate } from '../types';
import { actions } from './actions';
import { ensurePolygonList, isPolygonClosed, isPolygonList } from '../helpers';
import { polygonEditReducer } from './reducer';
import { isValidPolygon } from './validators';

type PolygonEditor = {
    selection: Set<number>;
    polygons: Coordinate[][];
    isPolygonClosed: boolean;
    addPoint: (coord: Coordinate) => void;
    addPointToEdge: (coordinate: Coordinate, index: number) => void;
    deselectAllPoints: () => void;
    removePointFromSelection: (index: number) => void;
    addPointsToSelection: (indices: number[]) => void;
    selectPoints: (indices: number[]) => void;
    moveSelectedPoints: (newPosition: Coordinate) => void;
    deletePolygonPoints: () => void;
    selectAllPoints: () => void;
    setPolygon: (polygon: Coordinate[]) => void;
    redo: () => void;
    undo: () => void;
    isUndoPossible: boolean;
    isRedoPossible: boolean;
};

const { UndoRedoProvider, usePresent, useUndoRedo } = createUndoRedo(polygonEditReducer);

export default UndoRedoProvider;

export const usePolygonEditor = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    activeIndex: number
): PolygonEditor => {
    const [present, dispatch] = usePresent();
    const [undo, redo] = useUndoRedo();

    const isNotSamePolygons = !isEqual(polygons, present.polygons);
    const isNotSameActiveIndex = activeIndex !== present.activeIndex;
    const isCoordinatesArray = isPolygonList(polygons);
    const isEveryPolygonValid = useMemo(() => present.polygons.every(isValidPolygon), [present.polygons]);

    const handleChange = useCallback(() => {
        if (isNotSamePolygons) {
            onChange(isCoordinatesArray ? present.polygons : present.polygons[0], isEveryPolygonValid);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCoordinatesArray, isNotSamePolygons, isEveryPolygonValid]);

    useEffect(() => {
        if (isNotSameActiveIndex) {
            dispatch(actions.setActiveIndex(activeIndex));
        }
    }, [activeIndex, dispatch, isNotSameActiveIndex]);

    useEffect(() => {
        if (isNotSamePolygons) {
            dispatch(actions.changePolygons(ensurePolygonList(polygons)));
        }
    }, [polygons, dispatch, isNotSamePolygons]);

    useEffect(() => {
        handleChange();
    }, [handleChange]);

    const activePolygon = useMemo(() => present.polygons[present.activeIndex], [present.polygons, present.activeIndex]);

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

    return {
        selection: present.selection,
        polygons: present.polygons,
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
        redo,
        undo,
        isRedoPossible: redo.isPossible,
        isUndoPossible: undo.isPossible,
    };
};
