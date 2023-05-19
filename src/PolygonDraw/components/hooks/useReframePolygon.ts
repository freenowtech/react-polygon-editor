import { useCallback } from 'react';
import flatten from 'lodash.flatten';

import { Coordinate, MapType } from '../../../types';
import { usePolygonEditor } from '../../usePolygonEditor';
import { createLeafletLatLngBoundsFromCoordinates } from '../../../helpers';
import { LatLngTuple } from 'leaflet';
import { MAP } from '../../../constants';

export const useReframePolygon = (
    onChange: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void = () => {},
    polygon: Coordinate[] | Coordinate[][],
    activeIndex: number,
    boundaryPolygonCoordinates: Coordinate[],
    initialCenter: LatLngTuple,
    initialZoom: number,
    map: MapType | null
) => {
    const { activePolygon, polygons } = usePolygonEditor(onChange, polygon, activeIndex);

    const reframeOnPolygon = useCallback(
        (polygons: Coordinate[] | Coordinate[][]) => {
            if (map && polygons.length > 0) {
                const bounds = createLeafletLatLngBoundsFromCoordinates(flatten(polygons));

                map.fitBounds(bounds);
            }
        },
        [map]
    );

    // reframe on boundary change and on initial load
    const reframeUpdate = useCallback(() => {
        if (activePolygon.length > 1) {
            reframeOnPolygon(polygons);
        } else if (boundaryPolygonCoordinates.length > 0 && boundaryPolygonCoordinates !== MAP.WORLD_COORDINATES) {
            reframeOnPolygon(boundaryPolygonCoordinates);
        } else if (map) {
            map.setView(initialCenter, initialZoom);
        }
    }, [activePolygon.length, boundaryPolygonCoordinates, map, reframeOnPolygon, polygons, initialCenter, initialZoom]);

    return { reframeOnPolygon, reframeUpdate };
};
