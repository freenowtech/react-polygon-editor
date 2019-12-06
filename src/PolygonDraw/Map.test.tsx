import { LeafletMouseEvent } from 'leaflet';
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
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
import { actions } from './actions';
import { Map } from '../leaflet/Map';

describe('Map component', () => {
    const OPEN_POLYGON = [MOCK_POLYGON[0]];
    const coordinate = getCenterCoordinate(MOCK_POLYGON[10], MOCK_POLYGON[12]);
    const event = { latlng: createLeafletLatLngFromCoordinate(coordinate) } as LeafletMouseEvent;

    let initialProps: Props;
    let wrapper: ShallowWrapper<Props, State, BaseMap>;

    beforeEach(() => {
        initialProps = {
            polygonCoordinates: MOCK_POLYGON,
            boundaryPolygonCoordinates: MOCK_POLYGON,
            selection: new Set<number>(),
            editable: true,
            dispatch: jest.fn(),
            initialCenter: MAP.DEFAULT_CENTER,
            initialZoom: MAP.DEFAULT_ZOOM
        };
    });

    describe('WHEN polygon is NOT disabled', () => {
        it('should NOT enable pen tool', () => {
            wrapper = shallow(<BaseMap {...initialProps} editable={false} />);
            expect(wrapper.state().isPenToolActive).toBeFalsy();
        });

        describe('when user moves mouse on map', () => {
            it('should not track mouse position if pen tool is disabled', () => {
                wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={OPEN_POLYGON} />);
                const MapElement = wrapper.find(Map);

                expect(wrapper.state().newPointPosition).toEqual(null);
                // @ts-ignore
                MapElement.prop('onmousemove')(event);

                setTimeout(() => {
                    expect(wrapper.state().newPointPosition).toEqual(null);
                });
            });
        });
    });

    describe('WHEN polygon is disabled', () => {
        it('should enable pen tool', () => {
            wrapper = shallow(<BaseMap {...initialProps} />);
            expect(wrapper.state().isPenToolActive).toBeTruthy();
        });

        describe('Map events', () => {
            describe('when user clicks on map', () => {
                it('should deselect all points if polygon is closed and shift is not pressed', () => {
                    wrapper = shallow(<BaseMap {...initialProps} />);
                    const MapElement = wrapper.find(Map);

                    // @ts-ignore
                    MapElement.prop('onclick')(event);
                    setTimeout(() => {
                        expect(initialProps.dispatch).toHaveBeenCalledWith(actions.deselectAllPoints());
                    });
                });

                it('should add point if polygon is open and the point is in boundary', () => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={OPEN_POLYGON} />);
                    const MapElement = wrapper.find(Map);

                    // @ts-ignore
                    MapElement.prop('onclick')(event);
                    setTimeout(() => {
                        expect(initialProps.dispatch).toHaveBeenCalledWith(actions.addPoint(coordinate));
                    });
                });
            });

            describe('when user moves mouse on map', () => {
                it('should add point if polygon is open and the point is in boundary', () => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={OPEN_POLYGON} />);
                    const MapElement = wrapper.find(Map);

                    expect(wrapper.state().newPointPosition).toEqual(null);
                    // @ts-ignore
                    MapElement.prop('onmousemove')(event);

                    setTimeout(() => {
                        expect(wrapper.state().newPointPosition).toEqual(coordinate);
                    });
                });

                it('should not track mouse position if pen tool is disabled', () => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={OPEN_POLYGON} />);
                    wrapper.setState({ isPenToolActive: false });
                    const MapElement = wrapper.find(Map);

                    expect(wrapper.state().newPointPosition).toEqual(null);
                    // @ts-ignore
                    MapElement.prop('onmousemove')(event);

                    setTimeout(() => {
                        expect(wrapper.state().newPointPosition).toEqual(null);
                    });
                });

                it('should not track mouse position if polygon is closed', () => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={MOCK_POLYGON} />);
                    const MapElement = wrapper.find(Map);

                    expect(wrapper.state().newPointPosition).toEqual(null);
                    // @ts-ignore
                    MapElement.prop('onmousemove')(event);

                    setTimeout(() => {
                        expect(wrapper.state().newPointPosition).toEqual(null);
                    });
                });

                it('should not track mouse position if point is outside the boundary', () => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={OPEN_POLYGON} />);
                    const MapElement = wrapper.find(Map);

                    const outsideEvent = {
                        latlng: createLeafletLatLngFromCoordinate(MOCK_POLYGON[0])
                    } as LeafletMouseEvent;
                    expect(wrapper.state().newPointPosition).toEqual(null);
                    // @ts-ignore
                    MapElement.prop('onmousemove')(outsideEvent);

                    setTimeout(() => {
                        expect(wrapper.state().newPointPosition).toEqual(null);
                    });
                });
            });

            describe('when user moves mouse outside the map', () => {
                it('should not track mouse postion', () => {
                    wrapper = shallow(<BaseMap {...initialProps} />);
                    const MapElement = wrapper.find(Map);

                    wrapper.setState({ newPointPosition: MOCK_POLYGON[0] });
                    // @ts-ignore
                    MapElement.prop('onmouseout')(event);
                    setTimeout(() => {
                        expect(wrapper.state().newPointPosition).toEqual(null);
                    });
                });
            });

            describe('Vertex events', () => {
                beforeEach(() => {
                    wrapper = shallow(<BaseMap {...initialProps} polygonCoordinates={MOCK_POLYGON} />);
                });

                describe('when user clicks a vertex', () => {
                    it('should close polygon if user clicks the start vertex', () => {
                        const POLYGON = [MOCK_POLYGON[0], MOCK_POLYGON[1], MOCK_POLYGON[2]];
                        wrapper.setProps({ polygonCoordinates: POLYGON });
                        const vertex = wrapper.find(PolygonVertex).first();
                        vertex.prop('onClick')(0);
                        expect(initialProps.dispatch).toHaveBeenCalledWith(actions.addPoint(POLYGON[0]));
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

                            expect(initialProps.dispatch).toHaveBeenCalledWith(actions.removePointFromSelection(1));
                        });

                        it('should add point to selection', () => {
                            wrapper.setState({ isShiftPressed: true });
                            wrapper.setProps({ selection: new Set<number>([1]) });

                            const vertex = wrapper.find(PolygonVertex).first();
                            vertex.prop('onClick')(2);

                            expect(initialProps.dispatch).toHaveBeenCalledWith(actions.addPointsToSelection([2]));
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
                                polygonCoordinates={INSIDE_POLYGON}
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

                        expect(initialProps.dispatch).toHaveBeenCalledWith(actions.moveSelectedPoints(moveVector));
                        expect(wrapper.state().previousMouseMovePosition).toEqual(newPosition);
                    });

                    it('should not move selected vertices if the moved vertices are outside boundary', () => {
                        const vertex = wrapper.find(PolygonVertex).first();

                        vertex.prop('onDrag')(createLeafletLatLngFromCoordinate(INSIDE_POLYGON[1]));

                        expect(initialProps.dispatch).not.toHaveBeenCalled();
                        expect(wrapper.state().previousMouseMovePosition).toEqual(INSIDE_POLYGON[0]);
                    });
                });
            });
        });
    });
});
