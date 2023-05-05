import React from 'react';

import { Coordinate } from 'types';
import { createLeafletLatLngTupleFromCoordinate, ensurePolygonList } from '../helpers';

import { MAP } from '../constants';
import Map from './Map';
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
    const {
        polygons,
        selection,
        addPoint,
        addPointToEdge,
        setPolygon,
        deselectAllPoints,
        removePointFromSelection,
        addPointsToSelection,
        selectPoints,
        moveSelectedPoints,
        deletePolygonPoints,
        selectAllPoints,
        isPolygonClosed,
        undo,
        redo,
    } = usePolygonEditor(onChange, polygon, activeIndex);

    return (
        <Map
            selection={selection}
            editable={editable}
            initialCenter={initialCenter ? createLeafletLatLngTupleFromCoordinate(initialCenter) : MAP.DEFAULT_CENTER}
            initialZoom={initialZoom || MAP.DEFAULT_ZOOM}
            boundaryPolygonCoordinates={boundary || MAP.WORLD_COORDINATES}
            activePolygonIndex={activeIndex}
            highlightedPolygonIndex={highlightedIndex}
            polygonCoordinates={polygons}
            setPolygon={setPolygon}
            addPoint={addPoint}
            addPointToEdge={addPointToEdge}
            deselectAllPoints={deselectAllPoints}
            removePointFromSelection={removePointFromSelection}
            addPointsToSelection={addPointsToSelection}
            selectPoints={selectPoints}
            moveSelectedPoints={moveSelectedPoints}
            deletePolygonPoints={deletePolygonPoints}
            selectAllPoints={selectAllPoints}
            isPolygonClosed={isPolygonClosed}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onUndo={undo}
            onRedo={redo}
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
