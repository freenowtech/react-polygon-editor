import React from 'react'

import { Coordinate } from 'types'
import { createLeafletLatLngTupleFromCoordinate } from '../helpers'

import { MAP } from '../constants'
import { PolygonMap } from './PolygonMap'

export type Props<T extends Coordinate[] | Coordinate[][]> = {
    activeIndex?: number;
    boundary?: Coordinate[];
    editable?: boolean;
    highlightedIndex?: number;
    initialCenter?: Coordinate;
    initialZoom?: number;
    onChange?: (polygon: T, isValid: boolean) => void;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
    polygon: T;
};

export function PolygonDraw<T extends Coordinate[] | Coordinate[][]>({
    activeIndex = 0,
    boundary,
    editable = true,
    highlightedIndex,
    initialCenter,
    initialZoom,
    onChange,
    onClick,
    onMouseEnter,
    onMouseLeave,
    polygon,
}: Props<T>): React.ReactElement {
    return (
        <PolygonMap
            editable={editable}
            initialCenter={initialCenter ? createLeafletLatLngTupleFromCoordinate(initialCenter) : MAP.DEFAULT_CENTER}
            initialZoom={initialZoom || MAP.DEFAULT_ZOOM}
            boundaryPolygonCoordinates={boundary || MAP.WORLD_COORDINATES}
            activePolygonIndex={activeIndex}
            highlightedPolygonIndex={highlightedIndex}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            polygon={polygon}
            onChange={onChange}
        />
    );
}
