import { useCallback, useState } from 'react';

import { Coordinate } from '../../../types';
import { usePolygonEditor } from '../../usePolygonEditor';
import { useActionBarActions } from './useActionBar';

export const useKeyHandlers = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygon: Coordinate[] | Coordinate[][],
    activeIndex: number,
    editable: boolean,
    reframeUpdate: () => void
) => {
    const {
        deselectAllPoints,
        deletePolygonPoints,
        selectAllPoints,
        undo,
        redo,
        isRedoPossible,
        isUndoPossible,
        setNewPointPosition,
    } = usePolygonEditor(onChange, polygon, activeIndex);
    const { toggleVectorMode } = useActionBarActions(onChange, polygon, activeIndex, editable);

    const [isShiftPressed, setIsShiftPressed] = useState(false);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
                case 'Escape':
                    deselectAllPoints();
                    break;
                case 'Backspace':
                    deletePolygonPoints();
                    break;
                case 'Shift':
                    setIsShiftPressed(true);
                    break;
                case 'p':
                    toggleVectorMode(setNewPointPosition);
                    break;
                case 'd':
                    if (editable) {
                        deselectAllPoints();
                    }
                    break;
                case 'a':
                    if (editable) {
                        selectAllPoints();
                    }
                    break;
                case 'f':
                    reframeUpdate();
                    break;
                case 'y':
                    if (isRedoPossible) {
                        redo();
                    }
                    break;
                case 'z':
                    if (isUndoPossible) {
                        undo();
                    }
                    break;
            }
        },
        [
            deletePolygonPoints,
            deselectAllPoints,
            editable,
            isRedoPossible,
            isUndoPossible,
            redo,
            reframeUpdate,
            selectAllPoints,
            setNewPointPosition,
            toggleVectorMode,
            undo,
        ]
    );

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'Shift':
                setIsShiftPressed(false);
                break;
        }
    }, []);

    return { handleKeyDown, handleKeyUp, isShiftPressed };
};
