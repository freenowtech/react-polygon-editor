import { createUndoRedo } from 'react-undo-redo';
import { useMemo, useState } from 'react';
import { Coordinate } from 'types';
import isEqual from 'lodash.isequal';

import { Actions, actions } from './actions';
import { ensurePolygonList, isPolygonClosed, isPolygonList } from '../helpers';
import { PolygonEditState, polygonEditReducer, undoablePolygonEditReducer } from './reducer';
// import { isValidPolygon } from './validators';
// import { ActionCreators, StateWithHistory } from 'redux-undo';

const { UndoRedoProvider, usePresent, useUndoRedo } = createUndoRedo(polygonEditReducer);

export default UndoRedoProvider;

// TODO: add output type
export const usePolygonEditor = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygons: Coordinate[] | Coordinate[][],
    activeIndex: number
) => {
    // const polygonList = ensurePolygonList(polygons);
    const [present, dispatchPresent] = usePresent();
    const [undo,redo] = useUndoRedo();

    console.log({ present })

    const [selection, setSelection] = useState<Set<number>>(new Set());
    // const [editHistory, setEditHistory] = useState<Omit<StateWithHistory<PolygonEditState>, 'present'>>({
    //     past: [],
    //     future: [],
    // });

    /**
     * polygons: polygonList,
            activeIndex: activeIndex,
            selection: selection,
     */

    // const state: StateWithHistory<PolygonEditState> = {
    //     present: {
    //         polygons: polygonList,
    //         activeIndex: activeIndex,
    //         selection: selection,
    //     },
    //     ...editHistory,
    // };

    const dispatch = (action: Actions) => {
        dispatchPresent(action);

        // TODO: check if still needed and move to reducer as one source of truth
        if (!isEqual(selection, present.selection)) {
            setSelection(present.selection);
        }

        // TODO: test if this onChange can be handled in a useEffect
        // onChange(isPolygonList(polygons) ? present.polygons : newPolygons[0], newPolygons.every(isValidPolygon));
    };

    const activePolygon = useMemo(
        () => present.polygons[present.activeIndex],
        [present.polygons, present.activeIndex]
    );
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

    // const undo = () => {
    //     dispatch(ActionCreators.undo());
    // };

    // const redo = () => {
    //     dispatch(ActionCreators.redo());
    // };

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
        undo,
        redo,
    };
};
