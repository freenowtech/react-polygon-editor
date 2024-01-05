import { LatLngTuple } from 'leaflet';
import flatten from 'lodash.flatten';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

import { ActionBar } from '../ActionBar/ActionBar';
import { Modal } from '../common/components/Modal';
import { MAP } from '../constants';
import { ExportPolygonForm } from '../conversion/ExportPolygonForm';
import { ImportPolygonForm } from '../conversion/ImportPolygonForm';
import { createLeafletLatLngBoundsFromCoordinates } from '../helpers';
import { Container, Map } from '../leaflet/Map';
import { TileLayer } from '../leaflet/TileLayer';
import { Coordinate, RectangleSelection } from '../types';
import { BoundaryPolygon } from './components/BoundaryPolygon';
import { ActivePolygon } from './components/ActivePolygon';
import { InactivePolygon } from './components/InactivePolygon';
import { PolygonPane } from './components/PolygonPane';
import { Polyline } from './components/Polyline';
import { SelectionRectangle } from './components/SelectionRectangle';
import { MapInner } from './components/MapInner';

export interface PolygonMapProps {
    activePolygon: Coordinate[];
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
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
    onRedo: () => void;
    onUndo: () => void;
    polygonCoordinates: Coordinate[][];
    removePointFromSelection: (index: number) => void;
    selectAllPoints: () => void;
    selection: Set<number>;
    selectPoints: (indices: number[]) => void;
    setPolygon: (polygon: Coordinate[]) => void;
}

type MapType = ReturnType<typeof useMap>;

export const PolygonMap = ({
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
}: PolygonMapProps): React.ReactElement => {
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
    //                      Keyboard handling methods                        //
    ///////////////////////////////////////////////////////////////////////////

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            e.preventDefault();
            switch (e.key.toLocaleLowerCase()) {
                case 'escape':
                    deselectAllPoints();
                    break;
                case 'backspace':
                    deletePolygonPoints();
                    break;
                case 'shift':
                    if (!e.metaKey) {
                        setIsShiftPressed(true);
                    }
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
                    if (e.metaKey) {
                        if (e.shiftKey && isRedoPossible) {
                            onRedo();
                        } else if (isUndoPossible) {
                            onUndo();
                        }
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
                    activePolygon={activePolygon}
                    addPoint={addPoint}
                    boundaryPolygonCoordinates={boundaryPolygonCoordinates}
                    isPenToolActive={isPenToolActive}
                    isShiftPressed={isShiftPressed}
                    deselectAllPoints={deselectAllPoints}
                    setRectangleSelection={setRectangleSelection}
                    selectPoints={selectPoints}
                    rectangleSelection={rectangleSelection}
                    setNewPointPosition={setNewPointPosition}
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
