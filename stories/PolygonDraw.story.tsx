import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { PolygonDraw } from '../src/PolygonDraw/PolygonDraw';
import { Coordinate } from '../src/types';
import { BOUNDARY, POLYGON, POLYGON_ONE, POLYGON_TWO, POLYGON_THREE } from './polygons';
import { StateContainer } from './StateContainer';

const polygonUpdateAction = action('polygon changed');

storiesOf('PolygonDraw', module)
    .add('Default', () => (
        <StateContainer initialState={{ polygon: POLYGON }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    onChange={(polygon, isValid) => {
                        setState({ polygon });
                        polygonUpdateAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('Multiple Polygons', () => <PolygonDraw polygon={[POLYGON_ONE, POLYGON_TWO, POLYGON_THREE]} highlighted={0} />)
    .add('New', () => (
        <StateContainer initialState={{ polygon: [] as Coordinate[] }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    onChange={(polygon, isValid) => {
                        setState({ polygon });
                        polygonUpdateAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('Not Editable', () => <PolygonDraw editable={false} polygon={POLYGON} boundary={BOUNDARY} />)
    .add('With Boundary', () => (
        <StateContainer initialState={{ polygon: POLYGON }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    boundary={BOUNDARY}
                    onChange={(polygon, isValid) => {
                        setState({ polygon });
                        polygonUpdateAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('With initial center', () => (
        <PolygonDraw editable={false} polygon={[]} initialCenter={{ longitude: 2.1734, latitude: 41.3851 }} />
    ))
    .add('With initial zoom', () => <PolygonDraw editable={false} polygon={[]} initialZoom={6} />);
