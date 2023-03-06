import React from 'react';
import { CircleMarker as LeafletCircleMarker } from 'react-leaflet';

import { Coordinate } from 'types';
import { createLeafletLatLngFromCoordinate } from '../helpers';
import { MAP } from '../constants';

interface Props {
    coordinate: Coordinate;
    index: number;
    onClick: (coordinate: Coordinate, index: number) => void;
}

interface State {
    isHoverActive: boolean;
}

export class EdgeVertex extends React.Component<Props, State> {
    state = {
        isHoverActive: false,
    };

    handleMouseOver = () => this.setState({ isHoverActive: true });
    handleMouseOut = () => this.setState({ isHoverActive: false });
    handleClick = () => this.props.onClick(this.props.coordinate, this.props.index);

    render() {
        const { isHoverActive } = this.state;
        const { coordinate } = this.props;

        return (
            <LeafletCircleMarker
                fillColor={MAP.VERTEX_FILL_COLOR}
                fillOpacity={isHoverActive ? 1 : 0.8}
                color={MAP.POLYGON_ACTIVE_COLOR}
                opacity={isHoverActive ? 1 : 0.8}
                weight={isHoverActive ? 2 : 0.5}
                radius={isHoverActive ? 6 : 3}
                center={createLeafletLatLngFromCoordinate(coordinate)}
                eventHandlers={{
                    click: this.handleClick,
                    mouseover: this.handleMouseOver,
                    mouseout: this.handleMouseOut,
                }}
            />
        );
    }
}
