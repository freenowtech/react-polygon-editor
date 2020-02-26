import React, { memo } from 'react';
import { LatLng, LatLngTuple, LeafletMouseEvent } from 'leaflet';
import { Map as LeafletMap, Pane, Polygon, Polyline } from 'react-leaflet';

import { Coordinate } from 'types';

import {
    createCoordinateFromLeafletLatLng,
    createLeafletLatLngBoundsFromCoordinates,
    createLeafletLatLngFromCoordinate,
    addCoordinates,
    subtractCoordinates,
    getPolygonEdges,
    isCoordinateInPolygon,
    isPolygonClosed
} from '../helpers';
import { Modal } from '../common/components/Modal';
import { ExportPolygonForm } from '../conversion/ExportPolygonForm';
import { TileLayer } from '../leaflet/TileLayer';
import { MAP } from '../constants';
import { Actions, actions } from './actions';
import { Map, Container } from '../leaflet/Map';
import { ActionBar } from '../ActionBar/ActionBar';
import { EdgeVertex } from './EdgeVertex';
import { PolygonVertex } from './PolygonVertex';

interface MapSnapshot {
    reframe: boolean;
    size: string;
}

export interface Props {
    polygonCoordinates: Coordinate[];
    boundaryPolygonCoordinates: Coordinate[];
    selection: Set<number>;
    editable: boolean;
    initialCenter: LatLngTuple;
    initialZoom: number;

    dispatch: (action: Actions) => void;
}

export interface State {
    isMovedPointInBoundary: boolean;
    isShiftPressed: boolean;
    isMoveActive: boolean;
    previousMouseMovePosition?: Coordinate;
    isPenToolActive: boolean;
    newPointPosition: Coordinate | null;
    showExportPolygonModal: boolean;
}

export class BaseMap extends React.Component<Props, State> {
    readonly mapRef = React.createRef<LeafletMap>();

    state: State = {
        isMovedPointInBoundary: true,
        isShiftPressed: false,
        isMoveActive: false,
        previousMouseMovePosition: undefined,
        isPenToolActive: false,
        newPointPosition: null,
        showExportPolygonModal: false
    };

    dispatch: typeof actions = { ...actions };

    static getDerivedStateFromProps(props: Props, state: State): State {
        return {
            ...state,
            isPenToolActive: props.polygonCoordinates.length === 0 ? true : state.isPenToolActive
        };
    }

    constructor(props: Props) {
        super(props);
        this.setDispatcher();
    }

    componentDidMount() {
        this.reframe();
        this.toggleVectorMode();

        if (this.mapRef.current && this.mapRef.current.container) {
            this.mapRef.current.container.addEventListener('keydown', this.handleKeyDown, false);
            this.mapRef.current.container.addEventListener('keyup', this.handleKeyUp);
        }
    }

    componentWillUnmount() {
        if (this.mapRef.current && this.mapRef.current.container) {
            this.mapRef.current.container.removeEventListener('keydown', this.handleKeyDown, false);
            this.mapRef.current.container.removeEventListener('keyup', this.handleKeyUp);
        }
    }

    getSnapshotBeforeUpdate(prevProps: Props, prevState: State): MapSnapshot {
        const reframe =
            // Reframe when the polygon loads for the first time
            (prevProps.polygonCoordinates.length === 0 && this.props.polygonCoordinates.length > 1) ||
            // Reframe when the boundary polygon loads for the first time
            prevProps.boundaryPolygonCoordinates !== this.props.boundaryPolygonCoordinates;
        const size = this.getSize(this.mapRef.current);

        return { reframe, size };
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, { reframe, size }: MapSnapshot): void {
        if (reframe) {
            this.reframe();
        }

        if (this.mapRef.current && this.getSize(this.mapRef.current) !== size) {
            this.mapRef.current.leafletElement.invalidateSize();
        }
    }

    setDispatcher = () => {
        this.dispatch = Object.keys(actions).reduce((acc, actionKey) => {
            // tslint:disable-next-line
            acc[actionKey] = (...args: any[]) => this.props.dispatch(actions[actionKey](...args));
            return acc;
        }, {}) as typeof actions;
    };

    reframe = () => {
        const { polygonCoordinates, boundaryPolygonCoordinates, initialCenter, initialZoom } = this.props;
        if (polygonCoordinates.length > 1) {
            this.reframeOnPolygon(polygonCoordinates);
        } else if (boundaryPolygonCoordinates.length > 0 && boundaryPolygonCoordinates !== MAP.WORLD_COORDINATES) {
            this.reframeOnPolygon(boundaryPolygonCoordinates);
        } else if (this.mapRef.current) {
            this.mapRef.current.leafletElement.setView(initialCenter, initialZoom);
        }
    };

    reframeOnPolygon = (polygonCoordinates: Coordinate[]) => {
        if (this.mapRef.current && polygonCoordinates.length > 0) {
            const bounds = createLeafletLatLngBoundsFromCoordinates(polygonCoordinates);

            this.mapRef.current.leafletElement.fitBounds(bounds);
        }
    };

    toggleVectorMode = () => {
        if (!this.props.editable) {
            return;
        }
        this.setState({
            isPenToolActive: !this.state.isPenToolActive,
            newPointPosition: null
        });
    };

    getSize = (map: LeafletMap | null): string => {
        return map && map.container ? `${map.container.clientHeight}x${map.container.clientWidth}` : '';
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Export methods                               //
    ///////////////////////////////////////////////////////////////////////////

    handleExportPolygon = () => {
        // TODO: implement export
    };

    handleExportPolygonActionClicked = () => {
        this.setState({ showExportPolygonModal: true });
    };

    handleExportPolygonModalClosed = () => {
        this.setState({ showExportPolygonModal: false });
    };

    ///////////////////////////////////////////////////////////////////////////
    //                          Map Events methods                           //
    ///////////////////////////////////////////////////////////////////////////

    handleMapClick = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);
        if (
            this.state.isPenToolActive &&
            !isPolygonClosed(this.props.polygonCoordinates) &&
            isCoordinateInPolygon(coordinate, this.props.boundaryPolygonCoordinates)
        ) {
            this.dispatch.addPoint(coordinate);
        } else if (!this.state.isShiftPressed) {
            this.dispatch.deselectAllPoints();
        }
    };

    handleMouseMoveOnMap = (event: LeafletMouseEvent) => {
        const coordinate = createCoordinateFromLeafletLatLng(event.latlng);
        const newPointPosition =
            this.state.isPenToolActive &&
            !isPolygonClosed(this.props.polygonCoordinates) &&
            isCoordinateInPolygon(coordinate, this.props.boundaryPolygonCoordinates)
                ? coordinate
                : null;

        this.setState({ newPointPosition });
    };

    handleMouseOutOfMap = () => this.setState({ newPointPosition: null });

    ///////////////////////////////////////////////////////////////////////////
    //                           Vertex methods                              //
    ///////////////////////////////////////////////////////////////////////////

    onPolygonVertexClick = (index: number) => {
        if (
            index === 0 &&
            this.props.polygonCoordinates.length > 2 &&
            !isPolygonClosed(this.props.polygonCoordinates)
        ) {
            // Close polygon when user clicks the first point
            this.dispatch.addPoint({ ...this.props.polygonCoordinates[0] });
        } else if (this.state.isShiftPressed) {
            if (this.props.selection.has(index)) {
                this.dispatch.removePointFromSelection(index);
            } else {
                this.dispatch.addPointsToSelection([index]);
            }
        } else {
            this.dispatch.selectPoints([index]);
        }
    };

    startVertexMove = (latLng: LatLng) => {
        if (!this.state.isMoveActive) {
            this.setState({
                isMoveActive: true,
                previousMouseMovePosition: createCoordinateFromLeafletLatLng(latLng)
            });
        }
    };

    onPolygonVertexDragStart = (latLng: LatLng, index: number) => {
        if (!this.props.selection.has(index)) {
            if (this.state.isShiftPressed) {
                this.dispatch.addPointsToSelection([index]);
            } else {
                this.dispatch.selectPoints([index]);
            }
        }
        this.startVertexMove(latLng);
    };

    updateVertexPosition = (latLng: LatLng) => {
        if (this.state.isMoveActive && this.state.previousMouseMovePosition) {
            const coordinate: Coordinate = createCoordinateFromLeafletLatLng(latLng);
            const moveVector = subtractCoordinates(coordinate, this.state.previousMouseMovePosition);

            const nextCoordinates = Array.from(this.props.selection)
                .map(i => this.props.polygonCoordinates[i])
                .map(coord => addCoordinates(coord, moveVector));

            const inBoundary = nextCoordinates.every(nextCoordinate =>
                isCoordinateInPolygon(nextCoordinate, this.props.boundaryPolygonCoordinates)
            );

            if (inBoundary) {
                this.dispatch.moveSelectedPoints(moveVector);
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
                isMovedPointInBoundary: true
            });
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    //                      Keyboard handling methods                        //
    ///////////////////////////////////////////////////////////////////////////

    handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'Escape':
                this.dispatch.deselectAllPoints();
                break;
            case 'Backspace':
                this.dispatch.deletePolygonPoints();
                break;
            case 'Shift':
                this.setState({ isShiftPressed: true });
                break;
            case 'p':
                this.toggleVectorMode();
                break;
            case 'd':
                if (this.props.editable) {
                    this.dispatch.deselectAllPoints();
                }
                break;
            case 'a':
                if (this.props.editable) {
                    this.dispatch.selectAllPoints();
                }
                break;
            case 'f':
                this.reframe();
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

    renderPolygonPoints = () => this.props.polygonCoordinates.map(this.renderPolygonVertex);

    renderVertexEdge = (coordinate: Coordinate, index: number) => (
        <EdgeVertex key={index} index={index} coordinate={coordinate} onClick={this.dispatch.addPointToEdge} />
    );

    renderPolygonEdges = () => getPolygonEdges(this.props.polygonCoordinates).map(this.renderVertexEdge);

    renderPolygon = () => (
        <Polygon
            positions={this.props.polygonCoordinates.map(createLeafletLatLngFromCoordinate)}
            fillColor={MAP.POLYGON_COLOR}
            color={MAP.POLYGON_COLOR}
            interactive={false}
        />
    );

    renderPolyline = () => {
        const { newPointPosition } = this.state;
        const polygon = this.props.polygonCoordinates.map(createLeafletLatLngFromCoordinate);

        if (polygon.length === 0) {
            return null;
        }

        const newPath = [polygon[polygon.length - 1]];
        if (newPointPosition) {
            newPath.push(createLeafletLatLngFromCoordinate(newPointPosition));
        }

        return (
            <>
                <Polyline positions={polygon} color={MAP.POLYGON_COLOR} interactive={false} />
                <Polyline positions={newPath} color={MAP.POLYGON_COLOR} dashArray="2 12" interactive={false} />
            </>
        );
    };

    renderBoundaryPolygon = () => (
        <Polygon
            positions={[
                MAP.WORLD_LAT_LNG_COORDINATES,
                this.props.boundaryPolygonCoordinates.map(createLeafletLatLngFromCoordinate)
            ]}
            fillColor={MAP.BOUNDARY_COLOR}
            color={this.state.isMovedPointInBoundary ? MAP.BOUNDARY_COLOR : MAP.ERROR_BOUNDARY_COLOR}
            weight={this.state.isMovedPointInBoundary ? 0.4 : MAP.BORDER_WIDTH}
            interactive={false}
        />
    );

    render() {
        const { polygonCoordinates, editable, selection, initialZoom, initialCenter } = this.props;
        const { newPointPosition, isPenToolActive } = this.state;

        const polygonIsClosed = isPolygonClosed(polygonCoordinates);

        return (
            <Container>
                <Map
                    animate
                    fadeAnimation
                    trackResize
                    zoomControl={false}
                    ref={this.mapRef}
                    center={initialCenter}
                    zoom={initialZoom}
                    zoomDelta={2}
                    zoomSnap={1.5}
                    onclick={this.handleMapClick}
                    onmousemove={this.handleMouseMoveOnMap}
                    onmouseout={this.handleMouseOutOfMap}
                    boxZoom={false}
                    drawCursor={!!newPointPosition}
                >
                    {this.renderBoundaryPolygon()}
                    {polygonIsClosed ? this.renderPolygon() : this.renderPolyline()}

                    {editable && (
                        <Pane>
                            {this.renderPolygonPoints()}
                            {polygonIsClosed && isPenToolActive && this.renderPolygonEdges()}}
                        </Pane>
                    )}

                    <TileLayer />
                </Map>
                <ActionBar
                    editable={editable}
                    isVectorModeEnabled={isPenToolActive}
                    onDelete={this.dispatch.deletePolygonPoints}
                    onFocus={this.reframe}
                    onEnableVectorMode={this.toggleVectorMode}
                    deleteInactive={selection.size === 0}
                    onExport={this.handleExportPolygonActionClicked}
                />

                {this.state.showExportPolygonModal && (
                    <Modal onClose={this.handleExportPolygonModalClosed}>
                        <ExportPolygonForm
                            polygon={this.props.polygonCoordinates}
                            onSubmit={this.handleExportPolygon}
                        />
                    </Modal>
                )}
            </Container>
        );
    }
}

export default memo(BaseMap);
