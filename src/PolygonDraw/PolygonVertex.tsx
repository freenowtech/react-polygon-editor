import 'leaflet-path-drag';
import { FC, createRef, useCallback, useEffect, useState } from 'react';
import { CircleMarker, LatLng } from 'leaflet';
import { CircleMarker as ReactLeafletCircleMarker } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

type DragEvent = { target: { getLatLng: () => LatLng } };

export interface Props {
    coordinate: Coordinate;
    isSelected: boolean;
    index: number;
    onClick: (index: number) => void;
    onDragStart: (latlng: LatLng, index: number) => void;
    onDrag: (latlng: LatLng) => void;
    onDragEnd: () => void;
}

export const PolygonVertex: FC<Props> = ({
    coordinate,
    isSelected,
    index,
    onClick,
    onDrag,
    onDragEnd,
    onDragStart,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragged, setIsDragged] = useState(false);
    const [latLng, setLatLng] = useState(new LatLng(0, 0));

    const circleMarkerRef = createRef<CircleMarker>();

    useEffect(() => {
        if (!isDragged) {
            setLatLng(createLeafletLatLngFromCoordinate(coordinate));
        }
    }, [isDragged, coordinate]);

    const handleDragStart = useCallback(
        (event: DragEvent) => {
            onDragStart(event.target.getLatLng(), index);
            setIsDragged(true);
        },
        [index, onDragStart]
    );

    const handleDrag = useCallback(
        (event: DragEvent) => {
            if (isDragged) {
                onDrag(event.target.getLatLng());
            }
        },
        [isDragged, onDrag]
    );

    const handleDragEnd = useCallback(() => {
        onDragEnd();
        setIsDragged(false);
    }, [onDragEnd]);

    useEffect(() => {
        const marker = circleMarkerRef.current;
        if (marker) {
            marker.on('dragstart', handleDragStart);
            marker.on('drag', handleDrag);
            marker.on('dragend', handleDragEnd);
        }
        return () => {
            if (marker) {
                marker.off('dragstart', handleDragStart);
                marker.off('drag', handleDrag);
                marker.off('dragend', handleDragEnd);
            }
        };
    }, [circleMarkerRef, handleDrag, handleDragEnd, handleDragStart]);

    const handleClick = () => onClick(index);
    const handleMouseOver = () => setIsHovered(true);
    const handleMouseOut = () => setIsHovered(false);

    const selectedOrHovered = isSelected || isHovered;
    const hoveredAndNotSelected = isHovered && !isSelected;

    return (
        <ReactLeafletCircleMarker
            aria-label="Polygon"
            ref={circleMarkerRef}
            fillColor={MAP.VERTEX_FILL_COLOR}
            fillOpacity={1}
            color={MAP.POLYGON_ACTIVE_COLOR}
            opacity={hoveredAndNotSelected ? 0.6 : 1}
            weight={selectedOrHovered ? 4 : 1}
            radius={selectedOrHovered ? 6 : 4}
            center={latLng}
            eventHandlers={{
                click: handleClick,
                mouseover: handleMouseOver,
                mouseout: handleMouseOut,
            }}
            bubblingMouseEvents={false}
            // @ts-ignore
            draggable
        />
    );
};
