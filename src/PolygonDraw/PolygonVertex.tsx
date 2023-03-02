import 'leaflet-path-drag';
import React from 'react';
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

export interface State {
    isHovered: boolean;
    isDragged: boolean;
    latLng: LatLng;
}

export class PolygonVertex extends React.Component<Props, State> {
    private circleMarkerElement: CircleMarker;
    state = {
        isHovered: false,
        isDragged: false,
        latLng: new LatLng(0, 0)
    };

    static getDerivedStateFromProps = (props: Props, state: State) => {
        return state.isDragged ? state : { ...state, latLng: createLeafletLatLngFromCoordinate(props.coordinate) };
    };

    componentDidMount() {
        if (this.circleMarkerElement) {
            this.circleMarkerElement.on('dragstart', this.handleDragStart);
            this.circleMarkerElement.on('drag', this.handleDrag);
            this.circleMarkerElement.on('dragend', this.handleDragEnd);
        }
    }

    componentWillUnmount() {
        if (this.circleMarkerElement) {
            this.circleMarkerElement.off('dragstart', this.handleDragStart);
            this.circleMarkerElement.off('drag', this.handleDrag);
            this.circleMarkerElement.off('dragend', this.handleDragEnd);
        }
    }

    // tslint:disable-next-line
    setCircleMarkerRef = (ref: any) => {
        if (ref) {
            this.circleMarkerElement = ref;
        }
    };

    handleClick = () => this.props.onClick(this.props.index);
    handleMouseOver = () => this.setState({ isHovered: true });
    handleMouseOut = () => this.setState({ isHovered: false });

    handleDragStart = (event: DragEvent) => {
        this.props.onDragStart(event.target.getLatLng(), this.props.index);
        this.setState({ isDragged: true });
    };

    handleDrag = (event: DragEvent) => {
        if (this.state.isDragged) {
            this.props.onDrag(event.target.getLatLng());
        }
    };

    handleDragEnd = () => {
        this.props.onDragEnd();
        this.setState({ isDragged: false });
    };

    render() {
        const { isSelected } = this.props;
        const { isHovered, latLng } = this.state;
        const selectedOrHovered = isSelected || isHovered;
        const hoveredAndNotSelected = isHovered && !isSelected;

        return (
            <ReactLeafletCircleMarker
                ref={this.setCircleMarkerRef}
                fillColor={MAP.VERTEX_FILL_COLOR}
                fillOpacity={1}
                color={MAP.POLYGON_ACTIVE_COLOR}
                opacity={hoveredAndNotSelected ? 0.6 : 1}
                weight={selectedOrHovered ? 4 : 1}
                radius={selectedOrHovered ? 6 : 4}
                center={latLng}
                eventHandlers={{
                    click: this.handleClick,
                    mouseover: this.handleMouseOver,
                    mouseout: this.handleMouseOut
                }}
                bubblingMouseEvents={false}
                // @ts-ignore
                draggable
            />
        );
    }
}
