import { FunctionComponent } from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

interface Props {
    coordinates: Coordinate[];
    hasError: boolean;
}

export const BoundaryPolygon: FunctionComponent<Props> = ({ coordinates, hasError }) => (
    <LeafletPolygon
        positions={[MAP.WORLD_LAT_LNG_COORDINATES, coordinates.map(createLeafletLatLngFromCoordinate)]}
        fillColor={MAP.BOUNDARY_COLOR}
        color={hasError ? MAP.ERROR_BOUNDARY_COLOR : MAP.BOUNDARY_COLOR}
        weight={hasError ? MAP.BORDER_WIDTH : 0.4}
        interactive={false}
    />
);
