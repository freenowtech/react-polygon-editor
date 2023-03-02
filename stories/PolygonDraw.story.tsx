import React, { useEffect, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { PolygonDraw } from '../src/PolygonDraw/PolygonDraw';
import { Coordinate } from '../src/types';
import { BOUNDARY, POLYGON, POLYGON_ONE, POLYGON_TWO, POLYGON_THREE } from './polygons';
import { StateContainer } from './StateContainer';

import 'leaflet/dist/leaflet.css';

const SAMPLES: Coordinate[][] = [POLYGON_ONE, POLYGON_TWO, POLYGON_THREE];

const polygonChangeAction = action('polygon changed');
const polygonClickedAction = action('polygon clicked');
const polygonMouseEnterAction = action('polygon mouseenter');
const polygonMouseLeaveAction = action('polygon mouseleave');

storiesOf('PolygonDraw', module)
    .add('Default', () => (
        <StateContainer initialState={{ polygon: POLYGON }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    onChange={(polygon, isValid) => {
                        setState({ polygon: polygon });
                        polygonChangeAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('Multiple Polygons', () => {
        const [activeIndex, setActiveIndex] = useState(0);
        const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);
        const [polygons, setPolygons] = useState(SAMPLES);

        return (
            <PolygonDraw
                polygon={polygons}
                activeIndex={activeIndex}
                highlightedIndex={highlightedIndex}
                onClick={setActiveIndex}
                onChange={newPolygons => setPolygons(newPolygons)}
                onMouseEnter={index => setHighlightedIndex(index)}
                onMouseLeave={index => setHighlightedIndex(oldIndex => (oldIndex === index ? undefined : oldIndex))}
            />
        );
    })
    .add('Automatic replace', () => {
        const [index, setIndex] = useState(0);

        useEffect(() => {
            const id = setInterval(() => {
                setIndex(oldIndex => {
                    return (oldIndex + 1) % SAMPLES.length;
                });
            }, 1000);
            return () => clearInterval(id);
        }, []);

        return (
            <PolygonDraw
                polygon={SAMPLES[index]}
                activeIndex={0}
                editable={false}
                onClick={i => polygonClickedAction(i)}
                onChange={i => polygonChangeAction(i)}
                onMouseEnter={i => polygonMouseEnterAction(i)}
                onMouseLeave={i => polygonMouseLeaveAction(i)}
            />
        );
    })
    .add('New', () => (
        <StateContainer initialState={{ polygon: [] as Coordinate[] }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    onChange={(polygon, isValid) => {
                        setState({ polygon });
                        polygonChangeAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('Not Editable', () => <PolygonDraw editable={false} polygon={POLYGON} boundary={BOUNDARY} />)
    .add('Highlighted', () => (
        <PolygonDraw editable={false} highlightedIndex={2} polygon={SAMPLES} boundary={BOUNDARY} />
    ))
    .add('With Boundary', () => (
        <StateContainer initialState={{ polygon: POLYGON }}>
            {(state, setState) => (
                <PolygonDraw
                    polygon={state.polygon}
                    boundary={BOUNDARY}
                    onChange={(polygon, isValid) => {
                        setState({ polygon });
                        polygonChangeAction(polygon, isValid);
                    }}
                />
            )}
        </StateContainer>
    ))
    .add('With initial center', () => (
        <PolygonDraw editable={false} polygon={[]} initialCenter={{ longitude: 2.1734, latitude: 41.3851 }} />
    ))
    .add('With initial zoom', () => <PolygonDraw editable={false} polygon={[]} initialZoom={6} />);
