import { FC, useState } from 'react';
import { CircleMarker as LeafletCircleMarker } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

interface Props {
    coordinate: Coordinate;
    index: number;
    onClick: (coordinate: Coordinate, index: number) => void;
}

interface State {
    isHoverActive: boolean;
}

export const EdgeVertex: FC<Props> = ({ coordinate, index, onClick }) => {
    const [isHoverActive, setIsHoverActive] = useState(false);

    const handleMouseOver = () => setIsHoverActive(true);
    const handleMouseOut = () => setIsHoverActive(false);
    const handleClick = () => onClick(coordinate, index);

    return (
        <LeafletCircleMarker
            fillColor={MAP.VERTEX_FILL_COLOR}
            fillOpacity={isHoverActive ? 1 : 0.8}
            color={MAP.POLYGON_ACTIVE_COLOR}
            opacity={isHoverActive ? 1 : 0.8}
            weight={isHoverActive ? 2 : 0.5}
            radius={isHoverActive ? 6 : 3}
            center={createLeafletLatLngFromCoordinate(coordinate)}
            eventHandlers={{
                click: handleClick,
                mouseover: handleMouseOver,
                mouseout: handleMouseOut,
            }}
        />
    );
};
