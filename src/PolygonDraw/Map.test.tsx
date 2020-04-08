import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { LeafletMouseEvent } from 'leaflet';

import { MAP } from '../constants';
import {
    subtractCoordinates,
    createLeafletLatLngFromCoordinate,
    getPolygonEdges,
    getCenterCoordinate
} from '../helpers';
import { Props, BaseMap, State } from './Map';
import { MOCK_POLYGON } from '../mockPolygon';
import { PolygonVertex } from './PolygonVertex';

describe('Map component', () => {
    const coordinate = getCenterCoordinate(MOCK_POLYGON[10], MOCK_POLYGON[12]);
    const event = { latlng: createLeafletLatLngFromCoordinate(coordinate) } as LeafletMouseEvent;

    let initialProps: Props;
    let wrapper: ShallowWrapper<Props, State, BaseMap>;

    beforeEach(() => {
        initialProps = {
            activePolygonIndex: 0,
            polygonCoordinates: [MOCK_POLYGON],
            boundaryPolygonCoordinates: MOCK_POLYGON,
            selection: new Set<number>(),
            editable: true,
            initialCenter: MAP.DEFAULT_CENTER,
            initialZoom: MAP.DEFAULT_ZOOM,
            isPolygonClosed: true,
            addPoint: jest.fn(),
            addPointToEdge: jest.fn(),
            addPointsToSelection: jest.fn(),
            deselectAllPoints: jest.fn(),
            removePointFromSelection: jest.fn(),
            selectPoints: jest.fn(),
            selectAllPoints: jest.fn(),
            moveSelectedPoints: jest.fn(),
            deletePolygonPoints: jest.fn(),
            setPolygon: jest.fn(),
            onUndo: jest.fn(),
            onRedo: jest.fn()
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('WHEN polygon is NOT disabled', () => {
        it('should NOT enable pen tool', () => {
            wrapper = shallow(<BaseMap {...initialProps} editable={false} />);
            expect(wrapper.state().isPenToolActive).toBeFalsy();
        });
    });

    describe('WHEN polygon is disabled', () => {
        it('should enable pen tool', () => {
            wrapper = shallow(<BaseMap {...initialProps} />);
            expect(wrapper.state().isPenToolActive).toBeTruthy();
        });

        describe('Map events', () => {
            describe('Vertex events', () => {
                beforeEach(() => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={[MOCK_POLYGON]} />);
                });

                describe('when user clicks a vertex', () => {
                    it('should close polygon if user clicks the start vertex', () => {
                        const POLYGON = [MOCK_POLYGON[0], MOCK_POLYGON[1], MOCK_POLYGON[2]];
                        wrapper = shallow(
                            <BaseMap {...initialProps} isPolygonClosed={false} polygonCoordinates={[POLYGON]} />
                        );
                        const vertex = wrapper.find(PolygonVertex).first();
                        vertex.prop('onClick')(0);
                        expect(initialProps.addPoint).toHaveBeenCalledWith(POLYGON[0]);
                    });

                    it('should select point', () => {
                        const vertex = wrapper.find(PolygonVertex).first();
                        vertex.prop('onClick')(2);
                    });

                    describe('when shift is pressed', () => {
                        it('should remove point from selection', () => {
                            wrapper.setState({ isShiftPressed: true });
                            wrapper.setProps({ selection: new Set<number>([1]) });

                            const vertex = wrapper.find(PolygonVertex).first();
                            vertex.prop('onClick')(1);

                            expect(initialProps.removePointFromSelection).toHaveBeenCalledWith(1);
                        });

                        it('should add point to selection', () => {
                            wrapper.setState({ isShiftPressed: true });
                            wrapper.setProps({ selection: new Set<number>([1]) });

                            const vertex = wrapper.find(PolygonVertex).first();
                            vertex.prop('onClick')(2);

                            expect(initialProps.addPointsToSelection).toHaveBeenCalledWith([2]);
                        });
                    });
                });

                describe('when user starts moving a vertex', () => {
                    it('should update previous mouse position and activate move mode', () => {
                        const vertex = wrapper.find(PolygonVertex).first();

                        expect(wrapper.state().isMoveActive).toBeFalsy();
                        expect(wrapper.state().previousMouseMovePosition).toEqual(undefined);

                        vertex.prop('onDragStart')(event.latlng, 0);

                        expect(wrapper.state().isMoveActive).toBeTruthy();
                        expect(wrapper.state().previousMouseMovePosition).toEqual(coordinate);
                    });
                });

                describe('when user moves a vertex', () => {
                    const INSIDE_POLYGON = getPolygonEdges([
                        MOCK_POLYGON[0],
                        MOCK_POLYGON[2],
                        MOCK_POLYGON[4],
                        MOCK_POLYGON[6]
                    ]);

                    beforeEach(() => {
                        wrapper = shallow(
                            <BaseMap
                                {...initialProps}
                                polygonCoordinates={[INSIDE_POLYGON]}
                                selection={new Set<number>([0])}
                            />
                        );
                        wrapper.setState({ isMoveActive: true, previousMouseMovePosition: INSIDE_POLYGON[0] });
                    });

                    it('should move selected vertices if the moved vertices are in boundary', () => {
                        const vertex = wrapper.find(PolygonVertex).first();
                        const newPosition = getCenterCoordinate(INSIDE_POLYGON[0], INSIDE_POLYGON[1]);
                        const moveVector = subtractCoordinates(newPosition, INSIDE_POLYGON[0]);

                        vertex.prop('onDrag')(createLeafletLatLngFromCoordinate(newPosition));

                        expect(initialProps.moveSelectedPoints).toHaveBeenCalledWith(moveVector);
                        expect(wrapper.state().previousMouseMovePosition).toEqual(newPosition);
                    });

                    it('should not move selected vertices if the moved vertices are outside boundary', () => {
                        const vertex = wrapper.find(PolygonVertex).first();

                        vertex.prop('onDrag')(createLeafletLatLngFromCoordinate(INSIDE_POLYGON[1]));

                        expect(initialProps.moveSelectedPoints).not.toHaveBeenCalled();
                        expect(wrapper.state().previousMouseMovePosition).toEqual(INSIDE_POLYGON[0]);
                    });
                });
            });
        });
    });
});
