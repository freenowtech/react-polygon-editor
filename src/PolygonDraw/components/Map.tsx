import React, { memo } from 'react';
import { latLngBounds, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet';
import { useMap } from 'react-leaflet';
import flatten from 'lodash.flatten';

import { Coordinate, RectangleSelection } from 'types';

import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngBoundsFromCoordinates,
    createLeafletLatLngFromCoordinate,
    isCoordinateInPolygon,
    isPolygonClosed,
} from '../../helpers';
import { Modal } from '../../common/components/Modal';
import { ExportPolygonForm } from '../../conversion/ExportPolygonForm';
import { ImportPolygonForm } from '../../conversion/ImportPolygonForm';
import { TileLayer } from '../../leaflet/TileLayer';
import { MAP } from '../../constants';
import { Map, Container } from '../../leaflet/Map';
import { ActionBar } from '../../ActionBar/ActionBar';
import { BoundaryPolygon } from './BoundaryPolygon';
import MapInner from './MapInner';
import { SelectionRectangle } from './SelectionRectangle';
import { Polyline } from './Polyline';
import { ActivePolygon } from './ActivePolygon';
import { InactivePolygon } from './InactivePolygon';
import { PolygonPane } from './PolygonPane';

interface MapSnapshot {
    reframe: boolean;
    size: string;
}

export interface Props {
    /**
     * activePolygonIndex is the index of the polygon that is currently available for editing
     */
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

export interface State {
    isMovedPointInBoundary: boolean;
    isShiftPressed: boolean;
    rectangleSelection: RectangleSelection | null;
    isPenToolActive: boolean;
    newPointPosition: Coordinate | null;
    showExportPolygonModal: boolean;
    showImportPolygonModal: boolean;
}

export class BaseMap extends React.Component<Props, State> {
    private map: MapType | null = null;

    state: State = {
        isMovedPointInBoundary: true,
        isShiftPressed: false,
        rectangleSelection: null,
        isPenToolActive: false,
        newPointPosition: null,
        showExportPolygonModal: false,
        showImportPolygonModal: false,
    };

    static getDerivedStateFromProps(props: Props, state: State): State {
        return {
            ...state,
            isPenToolActive: props.polygonCoordinates.length === 0 ? true : state.isPenToolActive,
        };
    }

    componentDidMount() {
        this.reframe();
        this.toggleVectorMode();

        const container = this.map?.getContainer();

        if (container) {
            container.addEventListener('keydown', this.handleKeyDown, false);
            container.addEventListener('keyup', this.handleKeyUp);
        }
    }

    componentWillUnmount() {
        const container = this.map?.getContainer();

        if (container) {
            container.removeEventListener('keydown', this.handleKeyDown, false);
            container.removeEventListener('keyup', this.handleKeyUp);
        }
    }

    getSnapshotBeforeUpdate(prevProps: Props, prevState: State): MapSnapshot {
        const reframe =
            // Reframe when the polygon loads for the first time
            (prevProps.polygonCoordinates[prevProps.activePolygonIndex].length === 0 &&
                this.props.polygonCoordinates[this.props.activePolygonIndex].length > 1) ||
            // Reframe when the boundary polygon loads for the first time
            prevProps.boundaryPolygonCoordinates !== this.props.boundaryPolygonCoordinates;

        const size = this.getSize(this.map);

        return { reframe, size };
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, { reframe, size }: MapSnapshot): void {
        if (reframe) {
            this.reframe();
        }

        if (this.map && this.getSize(this.map) !== size) {
            this.map.invalidateSize();
        }
    }

    setMap = (map: MapType) => {
        if (map) {
            this.map = map;

            this.reframe();
            this.toggleVectorMode();

            const container = map?.getContainer();

            if (container) {
                container?.addEventListener('keydown', this.handleKeyDown, false);
                container?.addEventListener('keyup', this.handleKeyUp);
            }
        }
    };

    reframe = () => {
        const { polygonCoordinates, boundaryPolygonCoordinates, initialCenter, initialZoom } = this.props;

        if (polygonCoordinates[this.props.activePolygonIndex].length > 1) {
            this.reframeOnPolygon(polygonCoordinates);
        } else if (boundaryPolygonCoordinates.length > 0 && boundaryPolygonCoordinates !== MAP.WORLD_COORDINATES) {
            this.reframeOnPolygon(boundaryPolygonCoordinates);
        } else if (this.map) {
            this.map.setView(initialCenter, initialZoom);
        }
    };

    reframeOnPolygon = (polygonCoordinates: Coordinate[] | Coordinate[][]) => {
        if (this.map && polygonCoordinates.length > 0) {
            const bounds = createLeafletLatLngBoundsFromCoordinates(flatten(polygonCoordinates));

            this.map.fitBounds(bounds);
        }
    };

    toggleVectorMode = () => {
        if (!this.props.editable) {
            return;
        }
        this.setState({
            isPenToolActive: !this.state.isPenToolActive,
            newPointPosition: null,
        });
    };

    getSize = (map: MapType | null): string => {
        const container = map?.getContainer();
        return container ? `${container.clientHeight}x${container.clientWidth}` : '';
    };

    handleOnFocusClicked = () => {
        const activePolygon = this.props.polygonCoordinates[this.props.activePolygonIndex];
        if (activePolygon) {
            this.reframeOnPolygon(activePolygon);
        } else {
            this.reframe();
        }
    };

    updateIsMovedPointInBoundary = (check: boolean) => {
        this.setState({ isMovedPointInBoundary: check });
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Export / Import methods                      //
    ///////////////////////////////////////////////////////////////////////////

    handleExportPolygon = (serialized: string) => {
        navigator.clipboard.writeText(serialized);
    };

    handleExportPolygonActionClicked = () => {
        this.setState({ showExportPolygonModal: true });
    };

    handleExportPolygonModalClosed = () => {
        this.setState({ showExportPolygonModal: false });
    };

    handleImportPolygon = (coordinates: Coordinate[]) => {
        this.props.setPolygon(coordinates);
        this.reframeOnPolygon(coordinates);
    };

    handleImportPolygonActionClicked = () => {
        this.setState({ showImportPolygonModal: true });
    };

    handleImportPolygonModalClosed = () => {
        this.setState({ showImportPolygonModal: false });
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Map Events methods                           //
    ///////////////////////////////////////////////////////////////////////////

    handleMapClick = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);
        if (
            this.state.isPenToolActive &&
            !this.props.isPolygonClosed &&
            isCoordinateInPolygon(coordinate, this.props.boundaryPolygonCoordinates)
        ) {
            this.props.addPoint(coordinate);
        } else if (!this.state.isShiftPressed) {
            this.props.deselectAllPoints();
        }
    };

    handleMouseDownOnMap = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);

        if (this.state.isShiftPressed) {
            this.setState({
                rectangleSelection: {
                    startPosition: coordinate,
                    endPosition: coordinate,
                    startTime: new Date().getTime(),
                },
            });
        }
    };

    handleMouseUpOnMap = () => {
        if (this.state.rectangleSelection) {
            this.setState({
                rectangleSelection: null,
            });
        }
    };

    handleMouseMoveOnMap = (event: LeafletMouseEvent) => {
        const mouseCoordinate = createCoordinateFromLeafletLatLng(event.latlng);
        if (this.state.rectangleSelection && new Date().getTime() - this.state.rectangleSelection?.startTime >= 100) {
            const start = this.state.rectangleSelection.startPosition;
            if (start) {
                const bounds: LatLngBounds = latLngBounds(createLeafletLatLngFromCoordinate(start), event.latlng);

                const activePolygon: Coordinate[] | undefined =
                    this.props.polygonCoordinates[this.props.activePolygonIndex];
                if (activePolygon) {
                    const pointsInsideBounds: number[] = [];
                    activePolygon.forEach((point, index) => {
                        if (bounds.contains(createLeafletLatLngFromCoordinate(point))) {
                            pointsInsideBounds.push(index);
                        }
                    });
                    this.props.selectPoints(pointsInsideBounds);
                }
            }
            this.setState({
                rectangleSelection: {
                    ...this.state.rectangleSelection,
                    endPosition: mouseCoordinate,
                },
            });
        } else {
            const newPointPosition =
                this.state.isPenToolActive &&
                !this.props.isPolygonClosed &&
                isCoordinateInPolygon(mouseCoordinate, this.props.boundaryPolygonCoordinates)
                    ? mouseCoordinate
                    : null;

            this.setState({ newPointPosition });
        }
    };

    handleMouseOutOfMap = () =>
        this.setState({
            newPointPosition: null,
            rectangleSelection: null,
        });

    ///////////////////////////////////////////////////////////////////////////
    //                      Keyboard handling methods                        //
    ///////////////////////////////////////////////////////////////////////////

    handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        switch (e.key) {
            case 'Escape':
                this.props.deselectAllPoints();
                break;
            case 'Backspace':
                this.props.deletePolygonPoints();
                break;
            case 'Shift':
                this.setState({ isShiftPressed: true });
                break;
            case 'p':
                this.toggleVectorMode();
                break;
            case 'd':
                if (this.props.editable) {
                    this.props.deselectAllPoints();
                }
                break;
            case 'a':
                if (this.props.editable) {
                    this.props.selectAllPoints();
                }
                break;
            case 'f':
                this.reframe();
                break;
            case 'y':
                if (this.props.isRedoPossible) {
                    this.props.onRedo();
                }
                break;
            case 'z':
                if (this.props.isUndoPossible) {
                    this.props.onUndo();
                }
                break;
        }
    };

    handleKeyUp = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'Shift':
                this.setState({ isShiftPressed: false });
                break;
        }
    };

    render() {
        const activePolygon = this.props.polygonCoordinates[this.props.activePolygonIndex];
        const activePolygonIsClosed = isPolygonClosed(activePolygon);
        const { editable, selection, initialZoom, initialCenter } = this.props;
        const { newPointPosition, isPenToolActive } = this.state;

        return (
            <Container>
                <Map
                    fadeAnimation
                    trackResize
                    zoomControl={false}
                    ref={this.setMap}
                    center={initialCenter}
                    zoom={initialZoom}
                    zoomDelta={2}
                    zoomSnap={1.5}
                    boxZoom={false}
                    drawCursor={!!newPointPosition}
                >
                    <BoundaryPolygon
                        coordinates={this.props.boundaryPolygonCoordinates}
                        hasError={!this.state.isMovedPointInBoundary}
                    />

                    {this.props.isPolygonClosed ? (
                        <ActivePolygon
                            index={this.props.activePolygonIndex}
                            coordinates={this.props.polygonCoordinates}
                            onClick={this.props.onClick}
                            onMouseEnter={this.props.onMouseEnter}
                            onMouseLeave={this.props.onMouseLeave}
                        />
                    ) : (
                        <Polyline
                            activePolygonIndex={this.props.activePolygonIndex}
                            polygonCoordinates={this.props.polygonCoordinates}
                            newPointPosition={newPointPosition}
                        />
                    )}

                    {this.props.polygonCoordinates.map((positions, index) => {
                        return index !== this.props.activePolygonIndex ? (
                            <InactivePolygon
                                key={`${index}-${this.props.activePolygonIndex}`}
                                activePolygonIsClosed={activePolygonIsClosed}
                                positions={positions}
                                isHighlighted={index === this.props.highlightedPolygonIndex}
                                index={index}
                                onClick={this.props.onClick}
                                onMouseEnter={this.props.onMouseEnter}
                                onMouseLeave={this.props.onMouseLeave}
                            />
                        ) : null;
                    })}

                    {editable && (
                        <PolygonPane
                            activePolygon={activePolygon}
                            addPoint={this.props.addPoint}
                            addPointsToSelection={this.props.addPointsToSelection}
                            addPointToEdge={this.props.addPointToEdge}
                            boundaryPolygonCoordinates={this.props.boundaryPolygonCoordinates}
                            isPolygonClosed={this.props.isPolygonClosed}
                            isShiftPressed={this.state.isShiftPressed}
                            moveSelectedPoints={this.props.moveSelectedPoints}
                            removePointFromSelection={this.props.removePointFromSelection}
                            selection={this.props.selection}
                            selectPoints={this.props.selectPoints}
                            isPenToolActive={isPenToolActive}
                            isMovedPointInBoundary={this.state.isMovedPointInBoundary}
                            updateIsMovedPointInBoundary={this.updateIsMovedPointInBoundary}
                        />
                    )}

                    {this.state.rectangleSelection && (
                        <SelectionRectangle rectangleSelection={this.state.rectangleSelection} />
                    )}

                    <TileLayer />
                    <MapInner
                        onClick={this.handleMapClick}
                        onMouseOut={this.handleMouseOutOfMap}
                        onMouseMove={this.handleMouseMoveOnMap}
                        onMouseDown={this.handleMouseDownOnMap}
                        onMouseUp={this.handleMouseUpOnMap}
                    />
                </Map>
                <ActionBar
                    editable={editable}
                    isVectorModeEnabled={isPenToolActive}
                    onDelete={this.props.deletePolygonPoints}
                    onFocus={this.handleOnFocusClicked}
                    onEnableVectorMode={this.toggleVectorMode}
                    deleteInactive={selection.size === 0}
                    onExport={this.handleExportPolygonActionClicked}
                    onImport={this.handleImportPolygonActionClicked}
                />

                {this.state.showExportPolygonModal && (
                    <Modal onClose={this.handleExportPolygonModalClosed}>
                        <ExportPolygonForm polygon={activePolygon} onSubmit={this.handleExportPolygon} />
                    </Modal>
                )}

                {this.state.showImportPolygonModal && (
                    <Modal onClose={this.handleImportPolygonModalClosed}>
                        <ImportPolygonForm onSubmit={this.handleImportPolygon} />
                    </Modal>
                )}
            </Container>
        );
    }
}

export default memo(BaseMap);
