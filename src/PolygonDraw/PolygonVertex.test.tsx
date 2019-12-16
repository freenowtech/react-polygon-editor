import { shallow, ShallowWrapper } from 'enzyme';
import { LeafletMouseEvent } from 'leaflet';
import React from 'react';
import { CircleMarker } from 'react-leaflet';

import { Coordinate } from '../types';

import { createLeafletLatLngFromCoordinate } from '../helpers';
import { PolygonVertex, Props, State } from './PolygonVertex';

describe('PolygonVertex', () => {
    const coordinate: Coordinate = { longitude: 0, latitude: 0 };
    const leafletMouseEvent = { latlng: createLeafletLatLngFromCoordinate(coordinate) } as LeafletMouseEvent;
    const props: Props = {
        coordinate: { longitude: 0, latitude: 0 },
        isSelected: true,
        index: 0,

        onClick: jest.fn(),
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn()
    };

    let wrapper: ShallowWrapper<Props, State, PolygonVertex>;

    beforeEach(() => {
        wrapper = shallow(<PolygonVertex {...props} />);
    });

    describe('When point is NOT selected', () => {
        it('should render correctly', () => {
            wrapper.setProps({ isSelected: false });
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('When point is selected', () => {
        it('should render correctly', () => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('When point is hovered', () => {
        it('should render correctly', () => {
            wrapper.setState({ isHovered: true });
            expect(wrapper).toMatchSnapshot();
        });
    });

    it('should tirgger the onClick callback when user clicks the vertex', () => {
        wrapper.find(CircleMarker).prop('onClick')(leafletMouseEvent);

        expect(props.onClick).toHaveBeenCalledWith(props.index);
    });
});
