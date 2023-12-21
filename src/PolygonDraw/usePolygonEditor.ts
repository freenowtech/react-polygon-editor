import { useMemo } from 'react'
import { createUndoRedo } from 'react-undo-redo'

import { isPolygonClosed, isPolygonList } from '../helpers'
import { Coordinate } from '../types'
import { Action, DESELECT_ALL_POINTS, MOVE_SELECTED_POINTS, SELECT_ALL_POINTS, SET_ACTIVE_INDEX, actions } from './actions'
import { polygonEditReducer } from './reducer'
import { isValidPolygon } from './validators'

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
    onPolygonClick: (index: number) => void;
    deletePolygonPoints: () => void;
    selectAllPoints: () => void;
    setPolygon: (polygon: Coordinate[]) => void;
    redo: () => void;
    undo: () => void;
    isUndoPossible: boolean;
    isRedoPossible: boolean;
};

const unundoableActions = [MOVE_SELECTED_POINTS, SET_ACTIVE_INDEX, DESELECT_ALL_POINTS, SELECT_ALL_POINTS];

const { UndoRedoProvider, usePresent, useUndoRedo } = createUndoRedo(polygonEditReducer, {
    track: (action) => !unundoableActions.includes(action.type),
});

export default UndoRedoProvider;
export const usePolygonEditor = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    onClick?: (index: number) => void
): PolygonEditor => {
    const [present, dispatch] = usePresent();
    const [undo, redo] = useUndoRedo();

    const dispatchWithCallback = (dispatchAction: Action) => {
        dispatch(dispatchAction)
        onChange(
            isPolygonList(polygons) ? present.polygons : present.polygons[0],
            present.polygons.every(isValidPolygon)
        );
    }

    const activePolygon: Coordinate[] = useMemo(() => {
        return present.polygons[present.activeIndex];
    }, [present.polygons, present.activeIndex]);

    const onPolygonClick = (polygonIndex: number) => {
        onClick && onClick(polygonIndex);
        dispatchWithCallback(actions.setActiveIndex(polygonIndex));
    };

    const polygonIsClosed: boolean = useMemo(() => isPolygonClosed(activePolygon), [activePolygon]);

    const setPolygon = (polygon: Coordinate[]) => {
        dispatchWithCallback(actions.setPolygon(polygon));
    };

    const addPoint = (coordinate: Coordinate) => {
        dispatchWithCallback(actions.addPoint(coordinate));
    };

    const addPointToEdge = (coordinate: Coordinate, index: number) => {
        dispatchWithCallback(actions.addPointToEdge(coordinate, index));
    };

    const deselectAllPoints = () => {
        dispatchWithCallback(actions.deselectAllPoints());
    };

    const removePointFromSelection = (index: number) => {
        dispatchWithCallback(actions.removePointFromSelection(index));
    };

    const addPointsToSelection = (indices: number[]) => {
        dispatchWithCallback(actions.addPointsToSelection(indices));
    };

    const selectPoints = (indices: number[]) => {
        dispatchWithCallback(actions.selectPoints(indices));
    };

    const moveSelectedPoints = (movement: Coordinate) => {
        dispatchWithCallback(actions.moveSelectedPoints(movement));
    };

    const deletePolygonPoints = () => {
        dispatchWithCallback(actions.deletePolygonPoints());
    };

    const selectAllPoints = () => {
        dispatch(actions.selectAllPoints());
    };

    return {
        addPoint,
        addPointsToSelection,
        addPointToEdge,
        deletePolygonPoints,
        deselectAllPoints,
        isPolygonClosed: polygonIsClosed,
        isRedoPossible: redo.isPossible,
        isUndoPossible: undo.isPossible,
        moveSelectedPoints,
        onPolygonClick,
        polygons: present.polygons,
        redo,
        removePointFromSelection,
        selectAllPoints,
        selection: present.selection,
        selectPoints,
        setPolygon,
        undo,
    };
};
