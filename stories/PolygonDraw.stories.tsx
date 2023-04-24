import React, { useEffect, useState } from 'react';
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

export default {
    title: 'PolygonDraw',
};

export const Default = () => (
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
);

export const MultiplePolygons = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);
    const [polygons, setPolygons] = useState(SAMPLES);

    return (
        <PolygonDraw
            polygon={polygons}
            activeIndex={activeIndex}
            highlightedIndex={highlightedIndex}
            onClick={setActiveIndex}
            onChange={(newPolygons) => setPolygons(newPolygons)}
            onMouseEnter={(index) => setHighlightedIndex(index)}
            onMouseLeave={(index) => setHighlightedIndex((oldIndex) => (oldIndex === index ? undefined : oldIndex))}
        />
    );
};

export const AutomaticReplace = {
    render: () => {
        const [index, setIndex] = useState(0);

        useEffect(() => {
            const id = setInterval(() => {
                setIndex((oldIndex) => {
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
                onClick={(i) => polygonClickedAction(i)}
                onChange={(i) => polygonChangeAction(i)}
                onMouseEnter={(i) => polygonMouseEnterAction(i)}
                onMouseLeave={(i) => polygonMouseLeaveAction(i)}
            />
        );
    },

    name: 'Automatic replace',
};

export const New = () => (
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
);

export const NotEditable = () => <PolygonDraw editable={false} polygon={POLYGON} boundary={BOUNDARY} />;

export const Highlighted = () => (
    <PolygonDraw editable={false} highlightedIndex={2} polygon={SAMPLES} boundary={BOUNDARY} />
);

export const WithBoundary = () => (
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
);

export const WithInitialCenter = {
    render: () => (
        <PolygonDraw editable={false} polygon={[]} initialCenter={{ longitude: 2.1734, latitude: 41.3851 }} />
    ),

    name: 'With initial center',
};

export const WithInitialZoom = {
    render: () => <PolygonDraw editable={false} polygon={[]} initialZoom={6} />,
    name: 'With initial zoom',
};
