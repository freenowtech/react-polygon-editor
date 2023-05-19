import React, { useState } from 'react';
import { latLngBounds, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet';

import { Coordinate, RectangleSelection } from '../../types';

import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngFromCoordinate,
    isCoordinateInPolygon,
    isPolygonClosed as isPolgonClosedCheck,
} from '../../helpers';
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
import { useBaseMap } from './hooks/useMap';
import { useActionBarActions } from './hooks/useActionBar';
import { usePolygonEditor } from '../usePolygonEditor';

export type Props = {
    activePolygonIndex: number;
    boundaryPolygonCoordinates: Coordinate[];
    editable: boolean;
    highlightedPolygonIndex?: number;
    initialCenter: LatLngTuple;
    initialZoom: number;
    polygon: Coordinate[] | Coordinate[][];
    onChange?: (polygon: Coordinate[] | Coordinate[][], isValid: boolean) => void;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
};

export const BaseMap = React.memo(
    ({
        activePolygonIndex,
        boundaryPolygonCoordinates,
        editable,
        highlightedPolygonIndex,
        initialCenter,
        initialZoom,
        polygon,
        onChange = () => {},
        onClick,
        onMouseEnter,
        onMouseLeave,
    }: Props) => {
        const {
            polygons: polygonCoordinates,
            selection,
            activePolygon,
            addPoint,
            addPointToEdge,
            setPolygon,
            deselectAllPoints,
            removePointFromSelection,
            addPointsToSelection,
            selectPoints,
            moveSelectedPoints,
            deletePolygonPoints,
            isPolygonClosed,
            newPointPosition,
            setNewPointPosition,
        } = usePolygonEditor(onChange, polygon, activePolygonIndex);

        const { isShiftPressed, setMap, reframeOnPolygon, reframeUpdate } = useBaseMap(
            onChange,
            polygon,
            activePolygonIndex,
            boundaryPolygonCoordinates,
            editable,
            initialCenter,
            initialZoom
        );

        const { toggleVectorMode, isPenToolActive, handleOnFocusClicked } = useActionBarActions(
            onChange,
            polygon,
            activePolygonIndex,
            editable,
            reframeOnPolygon,
    reframeUpdate,
    setNewPointPosition
        );

        const [isMovedPointInBoundary, setIsMovedPointInBoundary] = useState(true);
        const [rectangleSelection, setRectangleSelection] = useState<RectangleSelection | null>(null);
        const [showExportPolygonModal, setShowExportPolygonModal] = useState(false);
        const [showImportPolygonModal, setShowImportPolygonModal] = useState(false);

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
                                activePolygonIsClosed={isPolgonClosedCheck(activePolygon)}
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
