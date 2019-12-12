import React, { FunctionComponent } from 'react';

import { Coordinate } from 'types';
import { createLeafletLatLngTupleFromCoordinate } from '../helpers';

import { MAP } from '../constants';
import Map from './Map';
import { usePolygonEditor } from './usePolygonEditor';

export type Props = {
    boundary?: Coordinate[];
    initialCenter?: Coordinate;
    initialZoom?: number;
    editable?: boolean;
    onChange?: (polygon: Coordinate[], isValid: boolean) => void;
    polygon: Coordinate[] | Coordinate[][];
    highlighted?: number;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
};

export const PolygonDraw: FunctionComponent<Props> = ({
    polygon = [],
    highlighted = 0,
    boundary,
    initialCenter,
    initialZoom,
    editable = true,
    onChange,
    onClick,
    onMouseEnter,
    onMouseLeave
}) => {
    const {
        polygons,
        selection,
        addPoint,
        addPointToEdge,
        deselectAllPoints,
        removePointFromSelection,
        addPointsToSelection,
        selectPoints,
        moveSelectedPoints,
        deletePolygonPoints,
        selectAllPoints,
        isPolygonClosed
    } = usePolygonEditor(onChange, polygon, highlighted);

    return (
        <Map
            selection={selection}
            editable={editable}
            initialCenter={initialCenter ? createLeafletLatLngTupleFromCoordinate(initialCenter) : MAP.DEFAULT_CENTER}
            initialZoom={initialZoom || MAP.DEFAULT_ZOOM}
            boundaryPolygonCoordinates={boundary || MAP.WORLD_COORDINATES}
            activePolygonIndex={highlighted}
            polygonCoordinates={polygons}
            addPoint={addPoint}
            addPointToEdge={addPointToEdge}
            deselectAllPoints={deselectAllPoints}
            removePointFromSelection={removePointFromSelection}
            addPointsToSelection={addPointsToSelection}
            selectPoints={selectPoints}
            moveSelectedPoints={moveSelectedPoints}
            deletePolygonPoints={deletePolygonPoints}
            selectAllPoints={selectAllPoints}
            isPolygonClosed={isPolygonClosed}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
};
