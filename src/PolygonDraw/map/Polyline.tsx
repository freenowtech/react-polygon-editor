import React from 'react';
import { Polyline as LeafletPolyline } from 'react-leaflet';

import { Coordinate } from '../../types';
import { MAP } from '../../constants';
import { createLeafletLatLngFromCoordinate } from '../../helpers';

interface Props {
    activePolygonIndex: number;
    newPointPosition: Coordinate | null;
    polygonCoordinates: Coordinate[][];
}

export const Polyline: React.FC<Props> = ({ activePolygonIndex, newPointPosition, polygonCoordinates }) => {
    const polygon = polygonCoordinates[activePolygonIndex].map(createLeafletLatLngFromCoordinate);

    if (polygon.length === 0) {
        return null;
    }

    const newPath = [polygon[polygon.length - 1]];
    if (newPointPosition) {
        newPath.push(createLeafletLatLngFromCoordinate(newPointPosition));
    }

    return (
        <>
            <LeafletPolyline positions={polygon} color={MAP.POLYGON_ACTIVE_COLOR} interactive={false} />
            <LeafletPolyline
                positions={newPath}
                color={MAP.POLYGON_ACTIVE_COLOR}
                dashArray="2 12"
                interactive={false}
            />
        </>
    );
};
