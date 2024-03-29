import React, { memo } from 'react';
import { LatLng, latLngBounds, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet';
import { useMap, Pane, Polyline, Rectangle } from 'react-leaflet';
import flatten from 'lodash.flatten';

import { Coordinate } from 'types';

import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngBoundsFromCoordinates,
    createLeafletLatLngFromCoordinate,
    addCoordinates,
    subtractCoordinates,
    getPolygonEdges,
    isCoordinateInPolygon,
    isPolygonClosed,
} from '../helpers';
import { Modal } from '../common/components/Modal';
import { ExportPolygonForm } from '../conversion/ExportPolygonForm';
import { ImportPolygonForm } from '../conversion/ImportPolygonForm';
import { TileLayer } from '../leaflet/TileLayer';
import { MAP } from '../constants';
import { Map, Container } from '../leaflet/Map';
import { ActionBar } from '../ActionBar/ActionBar';
import { EdgeVertex } from './EdgeVertex';
import { PolygonVertex } from './PolygonVertex';
import { BoundaryPolygon } from './BoundaryPolygon';
import { Polygon } from './Polygon';
import MapInner from './MapInner';

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
}

type MapType = ReturnType<typeof useMap>;

export interface State {
    isMovedPointInBoundary: boolean;
    isShiftPressed: boolean;
    isMoveActive: boolean;
    rectangleSelection: {
        startPosition: Coordinate;
        endPosition: Coordinate;
        startTime: number;
    } | null;
    previousMouseMovePosition?: Coordinate;
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
        isMoveActive: false,
        rectangleSelection: null,
        previousMouseMovePosition: undefined,
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
    //                           Vertex methods                              //
    ///////////////////////////////////////////////////////////////////////////

    onPolygonVertexClick = (index: number) => {
        if (
            index === 0 &&
            this.props.polygonCoordinates[this.props.activePolygonIndex].length > 2 &&
            !this.props.isPolygonClosed
        ) {
            // Close polygon when user clicks the first point
            this.props.addPoint({ ...this.props.polygonCoordinates[this.props.activePolygonIndex][0] });
        } else if (this.state.isShiftPressed) {
            if (this.props.selection.has(index)) {
                this.props.removePointFromSelection(index);
            } else {
                this.props.addPointsToSelection([index]);
            }
        } else {
            this.props.selectPoints([index]);
        }
    };

    startVertexMove = (latLng: LatLng) => {
        if (!this.state.isMoveActive) {
            this.setState({
                isMoveActive: true,
                previousMouseMovePosition: createCoordinateFromLeafletLatLng(latLng),
            });
        }
    };

    onPolygonVertexDragStart = (latLng: LatLng, index: number) => {
        if (!this.props.selection.has(index)) {
            if (this.state.isShiftPressed) {
                this.props.addPointsToSelection([index]);
            } else {
                this.props.selectPoints([index]);
            }
        }
        this.startVertexMove(latLng);
    };

    updateVertexPosition = (latLng: LatLng) => {
        if (this.state.isMoveActive && this.state.previousMouseMovePosition) {
            const coordinate: Coordinate = createCoordinateFromLeafletLatLng(latLng);
            const moveVector = subtractCoordinates(coordinate, this.state.previousMouseMovePosition);

            const nextCoordinates = Array.from(this.props.selection)
                .map((i) => this.props.polygonCoordinates[this.props.activePolygonIndex][i])
                .map((coord) => addCoordinates(coord, moveVector));

            const inBoundary = nextCoordinates.every((nextCoordinate) =>
                isCoordinateInPolygon(nextCoordinate, this.props.boundaryPolygonCoordinates)
            );

            if (inBoundary) {
                this.props.moveSelectedPoints(moveVector);
                this.setState({ previousMouseMovePosition: coordinate, isMovedPointInBoundary: true });
            } else {
                this.setState({ isMovedPointInBoundary: false });
            }
        }
    };

    endVertexMove = () => {
        if (this.state.isMoveActive) {
            this.setState({
                isMoveActive: false,
                previousMouseMovePosition: undefined,
                isMovedPointInBoundary: true,
            });
        }
    };

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
            case 'z':
                if (e.metaKey && e.shiftKey) {
                    this.props.onRedo();
                } else if (e.metaKey) {
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

    ///////////////////////////////////////////////////////////////////////////
    //                           Render methods                              //
    ///////////////////////////////////////////////////////////////////////////

    renderPolygonVertex = (coordinate: Coordinate, index: number) => {
        return (
            <PolygonVertex
                coordinate={coordinate}
                isSelected={this.props.selection.has(index)}
                key={index}
                index={index}
                onClick={this.onPolygonVertexClick}
                onDragStart={this.onPolygonVertexDragStart}
                onDrag={this.updateVertexPosition}
                onDragEnd={this.endVertexMove}
            />
        );
    };

    renderActivePolygonPoints = () => {
        return this.props.polygonCoordinates[this.props.activePolygonIndex].map(this.renderPolygonVertex);
    };

    renderVertexEdge = (coordinate: Coordinate, index: number) => (
        <EdgeVertex key={index} index={index} coordinate={coordinate} onClick={this.props.addPointToEdge} />
    );

    renderPolygonEdges = () => {
        return getPolygonEdges(this.props.polygonCoordinates[this.props.activePolygonIndex]).map(this.renderVertexEdge);
    };

    renderInactivePolygons = () => {
        const activePolygonIsClosed = isPolygonClosed(this.props.polygonCoordinates[this.props.activePolygonIndex]);

        return this.props.polygonCoordinates.map((coordinates, index) => {
            const eventHandler = {
                onClick: () => this.props.onClick && this.props.onClick(index),
                onMouseEnter: () => this.props.onMouseEnter && this.props.onMouseEnter(index),
                onMouseLeave: () => this.props.onMouseLeave && this.props.onMouseLeave(index),
            };

            return index === this.props.activePolygonIndex ? null : (
                <Polygon
                    key={`${index}-${coordinates.reduce((acc, cur) => acc + cur.latitude + cur.longitude, 0)}`}
                    coordinates={coordinates}
                    isActive={false}
                    isHighlighted={index === this.props.highlightedPolygonIndex}
                    {...(activePolygonIsClosed ? eventHandler : {})}
                />
            );
        });
    };

    renderActivePolygon = () => {
        const coordinates = this.props.polygonCoordinates[this.props.activePolygonIndex];
        const index = this.props.activePolygonIndex;
        return (
            <Polygon
                coordinates={coordinates}
                isActive
                isHighlighted={false}
                onClick={() => this.props.onClick && this.props.onClick(index)}
                onMouseEnter={() => this.props.onMouseEnter && this.props.onMouseEnter(index)}
                onMouseLeave={() => this.props.onMouseLeave && this.props.onMouseLeave(index)}
            />
        );
    };

    renderPolyline = () => {
        const { newPointPosition } = this.state;
        const polygon = this.props.polygonCoordinates[this.props.activePolygonIndex].map(
            createLeafletLatLngFromCoordinate
        );

        if (polygon.length === 0) {
            return null;
        }

        const newPath = [polygon[polygon.length - 1]];
        if (newPointPosition) {
            newPath.push(createLeafletLatLngFromCoordinate(newPointPosition));
        }

        return (
            <>
                <Polyline positions={polygon} color={MAP.POLYGON_ACTIVE_COLOR} interactive={false} />
                <Polyline positions={newPath} color={MAP.POLYGON_ACTIVE_COLOR} dashArray="2 12" interactive={false} />
            </>
        );
    };

    renderSelectionRectangle = () => {
        if (this.state.rectangleSelection) {
            const bounds: LatLngBounds = latLngBounds(
                createLeafletLatLngFromCoordinate(this.state.rectangleSelection.startPosition),
                createLeafletLatLngFromCoordinate(this.state.rectangleSelection.endPosition)
            );

            return (
                <Rectangle
                    color={MAP.RECTANGLE_SELECTION_COLOR}
                    fillColor={MAP.RECTANGLE_SELECTION_COLOR}
                    bounds={bounds}
                />
            );
        }
        return null;
    };

    render() {
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
                    {this.props.isPolygonClosed ? this.renderActivePolygon() : this.renderPolyline()}
                    {this.renderInactivePolygons()}

                    {editable && (
                        <Pane name="Polygon points">
                            {this.renderActivePolygonPoints()}
                            {this.props.isPolygonClosed && isPenToolActive && this.renderPolygonEdges()}
                        </Pane>
                    )}

                    {this.state.rectangleSelection && this.renderSelectionRectangle()}

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
                        <ExportPolygonForm
                            polygon={this.props.polygonCoordinates[this.props.activePolygonIndex]}
                            onSubmit={this.handleExportPolygon}
                        />
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
