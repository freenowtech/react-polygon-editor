import React, { useCallback, useEffect, useRef, useState } from 'react';
import { latLngBounds, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet';
import { useMap } from 'react-leaflet';
import flatten from 'lodash.flatten';

import { Coordinate, RectangleSelection } from '../../types';

import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngBoundsFromCoordinates,
    createLeafletLatLngFromCoordinate,
    isCoordinateInPolygon,
    isPolygonClosed as isPolgonClosedCheck,
} from '../../helpers';
import { MAP } from '../../constants';
import { Container, Map } from '../../leaflet/Map';
import { BoundaryPolygon } from './BoundaryPolygon';
import { ActivePolygon } from './ActivePolygon';
import { Polyline } from './Polyline';
import { InactivePolygon } from './InactivePolygon';
import { PolygonPane } from './PolygonPane';
import { SelectionRectangle } from './SelectionRectangle';
import { TileLayer } from '../../leaflet/TileLayer';
import MapInner from './MapInner';
import { ActionBar } from '../../ActionBar/ActionBar';
import { Modal } from '../../common/components/Modal';
import { ExportPolygonForm } from '../../conversion/ExportPolygonForm';
import { ImportPolygonForm } from '../../conversion/ImportPolygonForm';

export interface Props {
    /**
     * activePolygonIndex is the index of the polygon that is currently available for editing
     */
    activePolygonIndex: number;
    addPoint: (coord: Coordinate) => void;
    addPointsToSelection: (indices: number[]) => void;
    addPointToEdge: (coordinate: Coordinate, index: number) => void;
    boundaryPolygonCoordinates: Coordinate[];
    deletePolygonPoints: () => void;
    deselectAllPoints: () => void;
    editable: boolean;
    highlightedPolygonIndex?: number;
    initialCenter: LatLngTuple;
    initialZoom: number;
    isPolygonClosed: boolean;
    isRedoPossible: boolean;
    isUndoPossible: boolean;
    moveSelectedPoints: (newPosition: Coordinate) => void;
    onUndo: () => void;
    onRedo: () => void;
    polygonCoordinates: Coordinate[][];
    removePointFromSelection: (index: number) => void;
    selection: Set<number>;
    selectPoints: (indices: number[]) => void;
    selectAllPoints: () => void;
    setPolygon: (polygon: Coordinate[]) => void;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
}

type MapType = ReturnType<typeof useMap>;

export const BaseMap = React.memo(
    ({
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
        onUndo,
        onRedo,
        polygonCoordinates,
        removePointFromSelection,
        selection,
        selectPoints,
        selectAllPoints,
        setPolygon,
        onClick,
        onMouseEnter,
        onMouseLeave,
    }: Props) => {
        const map = useRef<MapType | null>(null);

        const [isMovedPointInBoundary, setIsMovedPointInBoundary] = useState(true);
        const [isShiftPressed, setIsShiftPressed] = useState(false);
        const [rectangleSelection, setRectangleSelection] = useState<RectangleSelection | null>(null);
        const [isPenToolActive, setIsPenToolActive] = useState(false);
        const [newPointPosition, setNewPointPosition] = useState<Coordinate | null>(null);
        const [showExportPolygonModal, setShowExportPolygonModal] = useState(false);
        const [showImportPolygonModal, setShowImportPolygonModal] = useState(false);

        const prevBoundaryPolygonCoordinatesRef = useRef(boundaryPolygonCoordinates);
        const reframeRef = useRef(false);
        const sizeRef = useRef('');

        const reframeOnPolygon = useCallback(
            (polygonCoordinates: Coordinate[] | Coordinate[][]) => {
                if (map.current && polygonCoordinates.length > 0) {
                    const bounds = createLeafletLatLngBoundsFromCoordinates(flatten(polygonCoordinates));

                    map.current.fitBounds(bounds);
                }
            },
            [map]
        );

        const reframeUpdate = useCallback(() => {
            if (polygonCoordinates[activePolygonIndex].length > 1) {
                reframeOnPolygon(polygonCoordinates);
            } else if (boundaryPolygonCoordinates.length > 0 && boundaryPolygonCoordinates !== MAP.WORLD_COORDINATES) {
                reframeOnPolygon(boundaryPolygonCoordinates);
            } else if (map.current) {
                map.current.setView(initialCenter, initialZoom);
            }
        }, [
            activePolygonIndex,
            boundaryPolygonCoordinates,
            initialCenter,
            initialZoom,
            map,
            polygonCoordinates,
            reframeOnPolygon,
        ]);

        const toggleVectorMode = useCallback(() => {
            if (!editable) {
                return;
            }
            setIsPenToolActive((prevPenState) => !prevPenState);
            setNewPointPosition(null);
        }, [editable]);

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
                        reframeUpdate();
                        break;
                    case 'y':
                        if (isRedoPossible) {
                            onRedo();
                        }
                        break;
                    case 'z':
                        if (isUndoPossible) {
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
                onUndo,
                reframeUpdate,
                selectAllPoints,
                toggleVectorMode,
            ]
        );

        const setMap = useCallback(
            (ref: MapType | null) => {
                if (ref) {
                    map.current = ref;

                    reframeUpdate();
                    toggleVectorMode();

                    const container = ref?.getContainer();

                    if (container) {
                        container?.addEventListener('keydown', handleKeyDown, false);
                        container?.addEventListener('keyup', handleKeyUp);
                    }
                }
            },
            [handleKeyDown, reframeUpdate, toggleVectorMode]
        );

        useEffect(() => {
            polygonCoordinates.length === 0 && setIsPenToolActive(true);
        }, [polygonCoordinates]);

        useEffect(() => {
            reframeUpdate();
            toggleVectorMode();

            const container = map.current?.getContainer();

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
        }, [handleKeyDown, map, reframeUpdate, toggleVectorMode]);

        useEffect(() => {
            reframeRef.current =
                (polygonCoordinates[activePolygonIndex].length === 0 &&
                    polygonCoordinates[activePolygonIndex].length > 1) ||
                // Reframe when the boundary polygon loads for the first time
                boundaryPolygonCoordinates !== prevBoundaryPolygonCoordinatesRef.current;

            if (reframeRef.current) {
                reframeUpdate();
            }

            if (map.current && getSize(map.current) !== sizeRef.current) {
                map.current.invalidateSize();
            }
        }, [polygonCoordinates, boundaryPolygonCoordinates, activePolygonIndex, map, reframeUpdate]);

        const getSize = (map: MapType | null): string => {
            const container = map?.getContainer();
            return container ? `${container.clientHeight}x${container.clientWidth}` : '';
        };

        const handleOnFocusClicked = () => {
            const activePolygon = polygonCoordinates[activePolygonIndex];
            if (activePolygon) {
                reframeOnPolygon(activePolygon);
            } else {
                reframeUpdate();
            }
        };

        const updateIsMovedPointInBoundary = (check: boolean) => {
            setIsMovedPointInBoundary(check);
        };

        ///////////////////////////////////////////////////////////////////////////
        //                          Export / Import methods                      //
        ///////////////////////////////////////////////////////////////////////////

        const handleExportPolygon = (serialized: string) => {
            navigator.clipboard.writeText(serialized);
        };

        const handleExportPolygonActionClicked = () => {
            setShowExportPolygonModal(true);
        };

        const handleExportPolygonModalClosed = () => {
            setShowExportPolygonModal(false);
        };

        const handleImportPolygon = (coordinates: Coordinate[]) => {
            setPolygon(coordinates);
            reframeOnPolygon(coordinates);
        };

        const handleImportPolygonActionClicked = () => {
            setShowImportPolygonModal(true);
        };

        const handleImportPolygonModalClosed = () => {
            setShowImportPolygonModal(false);
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

                    const activePolygon: Coordinate[] | undefined = polygonCoordinates[activePolygonIndex];
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
                setRectangleSelection({ ...rectangleSelection, endPosition: mouseCoordinate });
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
            setNewPointPosition(null);
            setRectangleSelection(null);
        };

        ///////////////////////////////////////////////////////////////////////////
        //                      Keyboard handling methods                        //
        ///////////////////////////////////////////////////////////////////////////

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Shift':
                    setIsShiftPressed(false);
                    break;
            }
        };

        const activePolygon = polygonCoordinates[activePolygonIndex];
        const activePolygonIsClosed = isPolgonClosedCheck(activePolygon);

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
                                activePolygonIsClosed={activePolygonIsClosed}
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
                            updateIsMovedPointInBoundary={updateIsMovedPointInBoundary}
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
                    onDelete={deletePolygonPoints}
                    onFocus={handleOnFocusClicked}
                    onEnableVectorMode={toggleVectorMode}
                    deleteInactive={selection.size === 0}
                    onExport={handleExportPolygonActionClicked}
                    onImport={handleImportPolygonActionClicked}
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
    }
);
