import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

interface Props {
    coordinates: Coordinate[];
    isActive: boolean;
}

export const Polygon: React.FC<Props> = ({ isActive, coordinates }) => (
    <LeafletPolygon
        positions={coordinates.map(createLeafletLatLngFromCoordinate)}
        dashArray={isActive ? '' : '4 12'}
        fillColor={isActive ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        color={isActive ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        interactive={false}
        data-testid="polygon"
    />
);
