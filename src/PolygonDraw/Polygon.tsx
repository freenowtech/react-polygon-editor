import React, { FunctionComponent } from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

// refers to https://leafletjs.com/reference-1.6.0.html#path-dasharray and
// https://developer.mozilla.org/de/docs/Web/SVG/Attribute/stroke-dasharray
// 4 describes the dash size, 12 the gap size
const DASH_STROKE_SIZE = '4 12';

interface Props {
    coordinates: Coordinate[];
    isActive: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const Polygon: FunctionComponent<Props> = ({ isActive, coordinates, onClick, onMouseEnter, onMouseLeave }) => (
    <LeafletPolygon
        positions={coordinates.map(createLeafletLatLngFromCoordinate)}
        dashArray={isActive ? '' : DASH_STROKE_SIZE}
        fillColor={isActive ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        color={isActive ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        data-testid="polygon"
        onclick={onClick}
        onmouseover={onMouseEnter}
        onmouseout={onMouseLeave}
    />
);
