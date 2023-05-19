import { useCallback, useState } from 'react';

import { usePolygonEditor } from '../../usePolygonEditor';
import { Coordinate } from '../../../types';

export type ActionBarActions = {
    handleOnFocusClicked: () => void;
    isPenToolActive: boolean;
    setIsPenToolActive: React.Dispatch<React.SetStateAction<boolean>>;
    toggleVectorMode: () => void;
};

export const useActionBarActions = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygon: Coordinate[] | Coordinate[][],
    activeIndex: number,
    editable: boolean,
    reframeOnPolygon: (polygons: Coordinate[] | Coordinate[][]) => void,
    reframeUpdate: () => void,
    setNewPointPosition: React.Dispatch<React.SetStateAction<Coordinate | null>>
): ActionBarActions => {
    const { activePolygon, polygons } = usePolygonEditor(onChange, polygon, activeIndex);

    const [isPenToolActive, setIsPenToolActive] = useState(polygons.length === 0);

    const handleOnFocusClicked = useCallback(
        () => {
            if (!!activePolygon.length) {
                reframeOnPolygon(polygons);
            } else {
                reframeUpdate();
            }
        },
        [activePolygon.length, polygons, reframeOnPolygon, reframeUpdate]
    );

    const toggleVectorMode = useCallback(
        () => {
            if (!editable) {
                return;
            }
            setIsPenToolActive((prevPenState) => !prevPenState);
            setNewPointPosition(null);
        },
        [editable, setNewPointPosition]
    );

    return {
        handleOnFocusClicked,
        isPenToolActive,
        setIsPenToolActive,
        toggleVectorMode,
    };
};
