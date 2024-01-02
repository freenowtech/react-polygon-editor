import { Pane } from 'react-leaflet';

import { Coordinate } from '../../../types';
import {
    addCoordinates,
    createCoordinateFromLeafletLatLng,
    getPolygonEdges,
    isCoordinateInPolygon,
    subtractCoordinates,
} from '../../../helpers';
import { PolygonVertex } from './PolygonVertex';
import { EdgeVertex } from './EdgeVertex';
import { LatLng } from 'leaflet';
import { useState } from 'react';

interface Props {
    activePolygon: Coordinate[];
    addPoint: (coord: Coordinate) => void;
    addPointsToSelection: (indices: number[]) => void;
    addPointToEdge: (coordinate: Coordinate, index: number) => void;
    boundaryPolygonCoordinates: Coordinate[];
    isPolygonClosed: boolean;
    isShiftPressed: boolean;
    moveSelectedPoints: (newPosition: Coordinate) => void;
    removePointFromSelection: (index: number) => void;
    selection: Set<number>;
    selectPoints: (indices: number[]) => void;
    isPenToolActive: boolean;
    isMovedPointInBoundary: boolean;
    updateIsMovedPointInBoundary: (check: boolean) => void;
}

export const PolygonPane: React.FC<Props> = ({
    activePolygon,
    addPoint,
    addPointsToSelection,
    addPointToEdge,
    boundaryPolygonCoordinates,
    isPenToolActive,
    isPolygonClosed,
    isShiftPressed,
    moveSelectedPoints,
    removePointFromSelection,
    selection,
    selectPoints,
    updateIsMovedPointInBoundary,
}) => {
    const [isMoveActive, setIsMoveActive] = useState(false);
    const [previousMouseMovePosition, setPreviousMouseMovePosition] = useState<Coordinate | undefined>(undefined);

    const onPolygonVertexClick = (index: number) => {
        if (index === 0 && activePolygon.length > 2 && !isPolygonClosed) {
            // Close polygon when user clicks the first point
            addPoint({ ...activePolygon[0] });
        } else if (isShiftPressed) {
            if (selection.has(index)) {
                removePointFromSelection(index);
            } else {
                addPointsToSelection([index]);
            }
        } else {
            selectPoints([index]);
        }
    };

    const startVertexMove = (latLng: LatLng) => {
        if (!isMoveActive) {
            setIsMoveActive(true);
            setPreviousMouseMovePosition(createCoordinateFromLeafletLatLng(latLng));
        }
    };

    const onPolygonVertexDragStart = (latLng: LatLng, index: number) => {
        if (!selection.has(index)) {
            if (isShiftPressed) {
                addPointsToSelection([index]);
            } else {
                selectPoints([index]);
            }
        }
        startVertexMove(latLng);
    };

    const updateVertexPosition = (latLng: LatLng) => {
        if (isMoveActive && previousMouseMovePosition) {
            const coordinate: Coordinate = createCoordinateFromLeafletLatLng(latLng);
            const moveVector = subtractCoordinates(coordinate, previousMouseMovePosition);

            const nextCoordinates = Array.from(selection)
                .map((i) => activePolygon[i])
                .map((coord) => addCoordinates(coord, moveVector));

            const inBoundary = nextCoordinates.every((nextCoordinate) =>
                isCoordinateInPolygon(nextCoordinate, boundaryPolygonCoordinates)
            );

            if (inBoundary) {
                moveSelectedPoints(moveVector);
                setPreviousMouseMovePosition(coordinate);
                updateIsMovedPointInBoundary(true);
            } else {
                updateIsMovedPointInBoundary(false);
            }
        }
    };

    const endVertexMove = () => {
        if (isMoveActive) {
            setIsMoveActive(false);
            setPreviousMouseMovePosition(undefined);
            updateIsMovedPointInBoundary(true);
        }
    };

    return (
        <Pane name="Polygon points">
            {activePolygon.map((coordinate: Coordinate, index: number) => {
                return (
                    <PolygonVertex
                        coordinate={coordinate}
                        isSelected={selection.has(index)}
                        key={index}
                        index={index}
                        onClick={onPolygonVertexClick}
                        onDragStart={onPolygonVertexDragStart}
                        onDrag={updateVertexPosition}
                        onDragEnd={endVertexMove}
                    />
                );
            })}

            {isPolygonClosed &&
                isPenToolActive &&
                getPolygonEdges(activePolygon).map((coordinate: Coordinate, index: number) => (
                    <EdgeVertex key={index} index={index} coordinate={coordinate} onClick={addPointToEdge} />
                ))}
        </Pane>
    );
};
