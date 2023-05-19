import React from 'react';

import { Coordinate } from 'types';
import { createLeafletLatLngTupleFromCoordinate, ensurePolygonList } from '../helpers';
import { MAP } from '../constants';
import { BaseMap as Map } from './components/MapV2';
import UndoRedoProvider, { usePolygonEditor } from './usePolygonEditor';

export type Props<T extends Coordinate[] | Coordinate[][]> = {
    boundary?: Coordinate[];
    initialCenter?: Coordinate;
    initialZoom?: number;
    editable?: boolean;
    onChange?: (polygon: T, isValid: boolean) => void;
    polygon: T;
    activeIndex?: number;
    highlightedIndex?: number;
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
};

function PolygonEditor<T extends Coordinate[] | Coordinate[][]>({
    polygon,
    activeIndex = 0,
    highlightedIndex,
    boundary,
    initialCenter,
    initialZoom,
    editable = true,
    onChange,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: Props<T>): React.ReactElement {
    return (
        <Map
            editable={editable}
            initialCenter={initialCenter ? createLeafletLatLngTupleFromCoordinate(initialCenter) : MAP.DEFAULT_CENTER}
            initialZoom={initialZoom || MAP.DEFAULT_ZOOM}
            boundaryPolygonCoordinates={boundary || MAP.WORLD_COORDINATES}
            activePolygonIndex={activeIndex}
            highlightedPolygonIndex={highlightedIndex}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            polygon={polygon}
            onChange={onChange}
        />
    );
}

export function PolygonDraw<T extends Coordinate[] | Coordinate[][]>(props: Props<T>): React.ReactElement {
    return (
        <UndoRedoProvider
            initialState={{ polygons: ensurePolygonList(props.polygon), selection: new Set(), activeIndex: props.activeIndex || 0 }}
        >
            <PolygonEditor {...props} />
        </UndoRedoProvider>
    );
}
