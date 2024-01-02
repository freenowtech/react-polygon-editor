import React from 'react';
import { Rectangle } from 'react-leaflet';
import { LatLngBounds, latLngBounds } from 'leaflet';

import { RectangleSelection } from '../../../types';
import { MAP } from '../../../constants';
import { createLeafletLatLngFromCoordinate } from '../../../helpers';

interface Props {
    rectangleSelection: RectangleSelection;
}

export const SelectionRectangle: React.FC<Props> = ({ rectangleSelection }) => {
    const bounds: LatLngBounds = latLngBounds(
        createLeafletLatLngFromCoordinate(rectangleSelection.startPosition),
        createLeafletLatLngFromCoordinate(rectangleSelection.endPosition)
    );

    return (
        <Rectangle color={MAP.RECTANGLE_SELECTION_COLOR} fillColor={MAP.RECTANGLE_SELECTION_COLOR} bounds={bounds} />
    );
};
