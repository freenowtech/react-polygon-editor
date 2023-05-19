import { useCallback, useEffect, useRef } from 'react';

import { Coordinate, MapType } from '../../../types';
import { usePolygonEditor } from '../../usePolygonEditor';
import { LatLngTuple } from 'leaflet';
import { useKeyHandlers } from './useKeyHandlers';
import { useReframePolygon } from './useReframePolygon';

type BaseMapType = {
    isShiftPressed: boolean;
    handleKeyUp(e: KeyboardEvent) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    setMap: (ref: MapType | null) => void;
    reframeOnPolygon: (polygons: Coordinate[] | Coordinate[][]) => void;
    reframeUpdate: () => void;
};

export const useBaseMap = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygon: Coordinate[] | Coordinate[][],
    activeIndex: number,
    boundaryPolygonCoordinates: Coordinate[],
    editable: boolean,
    initialCenter: LatLngTuple,
    initialZoom: number
) => {
    const { activePolygon } = usePolygonEditor(onChange, polygon, activeIndex);

    const map = useRef<MapType | null>(null);

    const { reframeOnPolygon, reframeUpdate } = useReframePolygon(
        onChange,
        polygon,
        activeIndex,
        boundaryPolygonCoordinates,
        initialCenter,
        initialZoom,
        map.current
    );

    const { handleKeyDown, handleKeyUp, isShiftPressed } = useKeyHandlers(
        onChange,
        polygon,
        activeIndex,
        editable,
        reframeUpdate
    );

    const prevBoundaryPolygonCoordinatesRef = useRef(boundaryPolygonCoordinates);
    const reframeRef = useRef(false);
    const sizeRef = useRef('');

    const setMap = useCallback(
        (ref: MapType | null) => {
            if (ref) {
                map.current = ref;

                const container = ref?.getContainer();

                if (container) {
                    container?.addEventListener('keydown', handleKeyDown, false);
                    container?.addEventListener('keyup', handleKeyUp);
                }
            }
        },
        [handleKeyDown, handleKeyUp]
    );

    const getSize = (map: MapType | null): string => {
        const container = map?.getContainer();
        return container ? `${container.clientHeight}x${container.clientWidth}` : '';
    };

    useEffect(() => {
        reframeRef.current =
            (activePolygon.length === 0 && activePolygon.length > 1) ||
            // Reframe when the boundary polygon loads for the first time
            boundaryPolygonCoordinates !== prevBoundaryPolygonCoordinatesRef.current;

        if (reframeRef.current) {
            reframeUpdate();
        }

        if (map.current && getSize(map.current) !== sizeRef.current) {
            map.current.invalidateSize();
        }
    }, [activePolygon, boundaryPolygonCoordinates, map, reframeUpdate]);

    useEffect(() => {
        reframeUpdate();

        setMap(map.current);

        return () => {
            if (map.current) {
                const container = map.current.getContainer();
                container.removeEventListener('keydown', handleKeyDown, false);
                container.removeEventListener('keyup', handleKeyUp);
            }
        };
    }, [handleKeyDown, handleKeyUp, reframeUpdate, setMap]);

    return {
        isShiftPressed,
        handleKeyUp,
        handleKeyDown,
        setMap,
        reframeOnPolygon,
        reframeUpdate,
    };
};
