import { latLngBounds, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet';
import flatten from 'lodash.flatten';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

import { MAP } from '../constants';
import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngBoundsFromCoordinates,
    createLeafletLatLngFromCoordinate,
    isCoordinateInPolygon,
} from '../helpers';
import { Container, Map } from '../leaflet/Map';
import { Coordinate, RectangleSelection } from '../types';
import { BoundaryPolygon } from './BoundaryPolygon';
import { ActivePolygon } from './map/ActivePolygon';
import { InactivePolygon } from './map/InactivePolygon';
import { Polyline } from './map/Polyline';
import { PolygonPane } from './map/PolygonPane';
import { SelectionRectangle } from './map/SelectionRectangle';
import { TileLayer } from '../leaflet/TileLayer';
import MapInner from './MapInner';
import { ActionBar } from '../ActionBar/ActionBar';
import { Modal } from '../common/components/Modal';
import { ExportPolygonForm } from '../conversion/ExportPolygonForm';
import { ImportPolygonForm } from '../conversion/ImportPolygonForm';

export interface PolygonMapProps {
    activePolygon: Coordinate[];
    activePolygonIndex: number;
    highlightedPolygonIndex?: number;
    polygonCoordinates: Coordinate[][];
    boundaryPolygonCoordinates: Coordinate[];
    selection: Set<number>;
    editable: boolean;
    initialCenter: LatLngTuple;
    initialZoom: number;
    isPolygonClosed: boolean;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
    addPoint: (coord: Coordinate) => void;
    addPointToEdge: (coordinate: Coordinate, index: number) => void;
    deselectAllPoints: () => void;
    removePointFromSelection: (index: number) => void;
    addPointsToSelection: (indices: number[]) => void;
    selectPoints: (indices: number[]) => void;
    moveSelectedPoints: (newPosition: Coordinate) => void;
    deletePolygonPoints: () => void;
    selectAllPoints: () => void;
    setPolygon: (polygon: Coordinate[]) => void;
    onUndo: () => void;
    onRedo: () => void;
    isRedoPossible: boolean;
    isUndoPossible: boolean;
}

type MapType = ReturnType<typeof useMap>;

export const PolygonMap: React.FC = ({
    activePolygon,
    activePolygonIndex,
    addPoint,
    addPointsToSelection,
    addPointToEdge,
    boundaryPolygonCoordinates,
    deletePolygonPoints,
    deselectAllPoints,
    editable,
    highlightedPolygonIndex,
    initialCenter,
    initialZoom,
    isPolygonClosed,
    isRedoPossible,
    isUndoPossible,
    moveSelectedPoints,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onRedo,
    onUndo,
    removePointFromSelection,
    polygonCoordinates,
    selectAllPoints,
    selection,
    selectPoints,
    setPolygon,
}: PolygonMapProps) => {
    const map = useRef<MapType | null>();

    const [isMovedPointInBoundary, setIsMovedPointInBoundary] = useState(true);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [rectangleSelection, setRectangleSelection] = useState<RectangleSelection | null>(null);
    const [isPenToolActive, setIsPenToolActive] = useState(polygonCoordinates.length === 0);
    const [newPointPosition, setNewPointPosition] = useState<Coordinate | null>(null);
    const [showExportPolygonModal, setShowExportPolygonModal] = useState(false);
    const [showImportPolygonModal, setShowImportPolygonModal] = useState(false);

    const reframe = useCallback(() => {
        if (polygonCoordinates[activePolygonIndex].length > 1) {
            reframeOnPolygon(polygonCoordinates);
        } else if (boundaryPolygonCoordinates.length > 0 && boundaryPolygonCoordinates !== MAP.WORLD_COORDINATES) {
            reframeOnPolygon(boundaryPolygonCoordinates);
        } else if (map.current) {
            map.current.setView(initialCenter, initialZoom);
        }
    }, [polygonCoordinates, activePolygonIndex, initialCenter, initialZoom, boundaryPolygonCoordinates]);

    const reframeOnPolygon = (polygonCoordinates: Coordinate[] | Coordinate[][]) => {
        if (map.current && !!polygonCoordinates.length) {
            const bounds = createLeafletLatLngBoundsFromCoordinates(flatten(polygonCoordinates));

            map.current.fitBounds(bounds);
        }
    };

    const toggleVectorMode = useCallback(() => {
        if (!editable) {
            return;
        }
        setIsPenToolActive((prevState) => !prevState);
        setNewPointPosition(null);
    }, [editable]);

    const handleOnFocusClicked = () => {
        if (activePolygon) {
            reframeOnPolygon(activePolygon);
        } else {
            reframe();
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Export / Import methods                      //
    ///////////////////////////////////////////////////////////////////////////

    const handleExportPolygon = (serialized: string) => navigator.clipboard.writeText(serialized);
    const handleExportPolygonActionClicked = () => setShowExportPolygonModal(true);
    const handleExportPolygonModalClosed = () => setShowExportPolygonModal(false);
    const handleImportPolygonActionClicked = () => setShowImportPolygonModal(true);
    const handleImportPolygonModalClosed = () => setShowImportPolygonModal(false);
    const handleImportPolygon = (coordinates: Coordinate[]) => {
        setPolygon(coordinates);
        reframeOnPolygon(coordinates);
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Map Events methods                           //
    ///////////////////////////////////////////////////////////////////////////

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

    ///////////////////////////////////////////////////////////////////////////
    //                      Keyboard handling methods                        //
    ///////////////////////////////////////////////////////////////////////////

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key) {
                case 'Escape':
                    deselectAllPoints();
                    break;
                case 'Backspace':
                    deletePolygonPoints();
                    break;
                case 'Shift':
                    setIsShiftPressed(true);
                    break;
                case 'p':
                    toggleVectorMode();
                    break;
                case 'd':
                    if (editable) {
                        deselectAllPoints();
                    }
                    break;
                case 'a':
                    if (editable) {
                        selectAllPoints();
                    }
                    break;
                case 'f':
                    reframe();
                    break;
                case 'z':
                    if (e.metaKey && e.shiftKey && isRedoPossible) {
                        onRedo();
                    } else if (e.metaKey && isUndoPossible) {
                        onUndo();
                    }
                    break;
            }
        },
        [
            deletePolygonPoints,
            deselectAllPoints,
            editable,
            isRedoPossible,
            isUndoPossible,
            onRedo,
            reframe,
            selectAllPoints,
            toggleVectorMode,
            onUndo,
        ]
    );

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'Shift':
                setIsShiftPressed(false);
                break;
        }
    }, []);

    useEffect(() => {
        reframe();
        toggleVectorMode();

        const container = map?.current?.getContainer();

        if (container) {
            container.addEventListener('keydown', handleKeyDown, false);
            container.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            if (container) {
                container.removeEventListener('keydown', handleKeyDown, false);
                container.removeEventListener('keyup', handleKeyUp);
            }
        };
    }, [map, handleKeyDown, handleKeyUp, reframe, toggleVectorMode]);

    const setMap = useCallback(
        (ref: MapType | null) => {
            if (ref) {
                map.current = ref;

                reframe();
                toggleVectorMode();

                const container = ref?.getContainer();

                if (container) {
                    container?.addEventListener('keydown', handleKeyDown, false);
                    container?.addEventListener('keyup', handleKeyUp);
                }
            }
        },
        [handleKeyDown, handleKeyUp, reframe, toggleVectorMode]
    );

    return (
        <Container>
            <Map
                fadeAnimation
                trackResize
                zoomControl={false}
                ref={setMap}
                center={initialCenter}
                zoom={initialZoom}
                zoomDelta={2}
                zoomSnap={1.5}
                boxZoom={false}
                drawCursor={!!newPointPosition}
            >
                <BoundaryPolygon coordinates={boundaryPolygonCoordinates} hasError={!isMovedPointInBoundary} />

                {isPolygonClosed ? (
                    <ActivePolygon
                        index={activePolygonIndex}
                        coordinates={polygonCoordinates}
                        onClick={onClick}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    />
                ) : (
                    <Polyline
                        activePolygonIndex={activePolygonIndex}
                        polygonCoordinates={polygonCoordinates}
                        newPointPosition={newPointPosition}
                    />
                )}

                {polygonCoordinates.map((positions, index) => {
                    return index !== activePolygonIndex ? (
                        <InactivePolygon
                            key={`${index}-${activePolygonIndex}`}
                            activePolygonIsClosed={isPolygonClosed}
                            positions={positions}
                            isHighlighted={index === highlightedPolygonIndex}
                            index={index}
                            onClick={onClick}
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                        />
                    ) : null;
                })}

                {editable && (
                    <PolygonPane
                        activePolygon={activePolygon}
                        addPoint={addPoint}
                        addPointsToSelection={addPointsToSelection}
                        addPointToEdge={addPointToEdge}
                        boundaryPolygonCoordinates={boundaryPolygonCoordinates}
                        isPolygonClosed={isPolygonClosed}
                        isShiftPressed={isShiftPressed}
                        moveSelectedPoints={moveSelectedPoints}
                        removePointFromSelection={removePointFromSelection}
                        selection={selection}
                        selectPoints={selectPoints}
                        isPenToolActive={isPenToolActive}
                        isMovedPointInBoundary={isMovedPointInBoundary}
                        updateIsMovedPointInBoundary={(check: boolean) => setIsMovedPointInBoundary(check)}
                    />
                )}

                {rectangleSelection && <SelectionRectangle rectangleSelection={rectangleSelection} />}

                <TileLayer />
                <MapInner
                    onClick={handleMapClick}
                    onMouseOut={handleMouseOutOfMap}
                    onMouseMove={handleMouseMoveOnMap}
                    onMouseDown={handleMouseDownOnMap}
                    onMouseUp={handleMouseUpOnMap}
                />
            </Map>
            <ActionBar
                editable={editable}
                isVectorModeEnabled={isPenToolActive}
                isRedoable={isRedoPossible}
                isUndoable={isUndoPossible}
                onDelete={deletePolygonPoints}
                onFocus={handleOnFocusClicked}
                onEnableVectorMode={toggleVectorMode}
                deleteInactive={selection.size === 0}
                onExport={handleExportPolygonActionClicked}
                onImport={handleImportPolygonActionClicked}
                onRedo={onRedo}
                onUndo={onUndo}
            />

            {showExportPolygonModal && (
                <Modal onClose={handleExportPolygonModalClosed}>
                    <ExportPolygonForm polygon={activePolygon} onSubmit={handleExportPolygon} />
                </Modal>
            )}

            {showImportPolygonModal && (
                <Modal onClose={handleImportPolygonModalClosed}>
                    <ImportPolygonForm onSubmit={handleImportPolygon} />
                </Modal>
            )}
        </Container>
    );
};
