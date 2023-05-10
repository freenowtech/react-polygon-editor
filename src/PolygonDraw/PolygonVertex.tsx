import 'leaflet-path-drag';
import { FC, useCallback, useEffect, useState } from 'react';
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

    let circleMarkerElement: CircleMarker;

    useEffect(() => {
        if (!isDragged && !!coordinate) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setCircleMarkerRef = (ref: any) => {
        if (ref) {
            circleMarkerElement = ref;
        }
    };

    useEffect(() => {
        if (circleMarkerElement) {
            circleMarkerElement.on('dragstart', handleDragStart);
            circleMarkerElement.on('drag', handleDrag);
            circleMarkerElement.on('dragend', handleDragEnd);
        }
        return () => {
            if (circleMarkerElement) {
                circleMarkerElement.off('dragstart', handleDragStart);
                circleMarkerElement.off('drag', handleDrag);
                circleMarkerElement.off('dragend', handleDragEnd);
            }
        };
        // circleMarkerElement cannot be set as dependency due to assignment issues
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleDrag, handleDragEnd, handleDragStart]);

    const handleClick = () => onClick(index);
    const handleMouseOver = () => setIsHovered(true);
    const handleMouseOut = () => setIsHovered(false);

    const selectedOrHovered = isSelected || isHovered;
    const hoveredAndNotSelected = isHovered && !isSelected;

    return (
        <ReactLeafletCircleMarker
            aria-label="Polygon"
            ref={setCircleMarkerRef}
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
