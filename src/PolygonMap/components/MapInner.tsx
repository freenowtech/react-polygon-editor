import { latLngBounds, LatLngBounds, LeafletMouseEvent } from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import {
    createCoordinateFromLeafletLatLng,
    isPolygonClosed,
    isCoordinateInPolygon,
    createLeafletLatLngFromCoordinate,
} from '../../helpers';
import { Coordinate, RectangleSelection } from '../../types';

type Props = {
    activePolygon: Coordinate[];
    addPoint: (coord: Coordinate) => void;
    boundaryPolygonCoordinates: Coordinate[];
    deselectAllPoints: () => void;
    isPenToolActive: boolean;
    isShiftPressed: boolean;
    rectangleSelection: RectangleSelection | null;
    selectPoints: (indices: number[]) => void;
    setNewPointPosition: React.Dispatch<React.SetStateAction<Coordinate | null>>;
    setRectangleSelection: React.Dispatch<React.SetStateAction<RectangleSelection | null>>;
};

export const MapInner = ({
    activePolygon,
    addPoint,
    boundaryPolygonCoordinates,
    deselectAllPoints,
    isPenToolActive,
    isShiftPressed,
    rectangleSelection,
    selectPoints,
    setNewPointPosition,
    setRectangleSelection,
}: Props) => {
    const handleMapClick = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);
        if (isPenToolActive && !isPolygonClosed && isCoordinateInPolygon(coordinate, boundaryPolygonCoordinates)) {
            addPoint(coordinate);
        } else if (!isShiftPressed) {
            deselectAllPoints();
        }
    };

    const handleMouseDownOnMap = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);

        if (isShiftPressed) {
            setRectangleSelection({
                startPosition: coordinate,
                endPosition: coordinate,
                startTime: new Date().getTime(),
            });
        }
    };

    const handleMouseUpOnMap = () => {
        if (rectangleSelection) {
            setRectangleSelection(null);
        }
    };

    const handleMouseMoveOnMap = (event: LeafletMouseEvent) => {
        const mouseCoordinate = createCoordinateFromLeafletLatLng(event.latlng);
        if (rectangleSelection && new Date().getTime() - rectangleSelection?.startTime >= 100) {
            const start = rectangleSelection.startPosition;
            if (start) {
                const bounds: LatLngBounds = latLngBounds(createLeafletLatLngFromCoordinate(start), event.latlng);

                if (activePolygon) {
                    const pointsInsideBounds: number[] = [];
                    activePolygon.forEach((point, index) => {
                        if (bounds.contains(createLeafletLatLngFromCoordinate(point))) {
                            pointsInsideBounds.push(index);
                        }
                    });
                    selectPoints(pointsInsideBounds);
                }
            }
            setRectangleSelection({
                ...rectangleSelection,
                endPosition: mouseCoordinate,
            });
        } else {
            const newPointPosition =
                isPenToolActive &&
                !isPolygonClosed &&
                isCoordinateInPolygon(mouseCoordinate, boundaryPolygonCoordinates)
                    ? mouseCoordinate
                    : null;

            setNewPointPosition(newPointPosition);
        }
    };

    const handleMouseOutOfMap = () => {
        setRectangleSelection(null);
        setNewPointPosition(null);
    };

    useMapEvents({
        click: handleMapClick,
        mousedown: handleMouseDownOnMap,
        mouseup: handleMouseUpOnMap,
        mousemove: handleMouseMoveOnMap,
        mouseout: handleMouseOutOfMap,
    });

    return null;
};
