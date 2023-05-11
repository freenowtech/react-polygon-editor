import { FunctionComponent } from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

// refers to https://leafletjs.com/reference-1.6.0.html#path-dasharray and
// https://developer.mozilla.org/de/docs/Web/SVG/Attribute/stroke-dasharray
// 4 describes the dash size, 12 the gap size
const DASH_STROKE_SIZE = '1 4';

interface Props {
    coordinates: Coordinate[];
    isActive: boolean;
    isHighlighted: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const Polygon: FunctionComponent<Props> = ({
    isActive,
    isHighlighted,
    coordinates,
    onClick,
    onMouseEnter,
    onMouseLeave,
}) => (
    <LeafletPolygon
        positions={coordinates.map(createLeafletLatLngFromCoordinate)}
        dashArray={isActive ? '' : DASH_STROKE_SIZE}
        fillColor={isActive || isHighlighted ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        weight={MAP.BORDER_WIDTH}
        color={isActive ? MAP.POLYGON_ACTIVE_COLOR : MAP.POLYGON_INACTIVE_COLOR}
        data-testid="polygon"
        eventHandlers={{
            click: onClick,
            mouseover: onMouseEnter,
            mouseout: onMouseLeave,
        }}
    />
);
