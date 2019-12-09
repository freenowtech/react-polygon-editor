import React from 'react';
import { Polygon } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

interface Props {
    coordinates: Coordinate[];
    hasError: boolean;
}

export const BoundaryPolygon: React.FC<Props> = ({ coordinates, hasError }) => (
    <Polygon
        positions={[MAP.WORLD_LAT_LNG_COORDINATES, coordinates.map(createLeafletLatLngFromCoordinate)]}
        fillColor={MAP.BOUNDARY_COLOR}
        color={hasError ? MAP.BOUNDARY_COLOR : MAP.ERROR_BOUNDARY_COLOR}
        weight={hasError ? 0.4 : MAP.BORDER_WIDTH}
        interactive={false}
    />
);
