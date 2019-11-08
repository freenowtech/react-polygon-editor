import React, { FunctionComponent, useState } from 'react';

import { Coordinate } from 'types';
import { createLeafletLatLngTupleFromCoordinate } from '../helpers';

import { Actions } from './actions';
import { MAP } from '../constants';
import { initialState, PolygonEditReducer } from './reducer';
import Map from './Map';
import { isValidPolygon } from './validators';

export interface Props {
    polygon: Coordinate[];
    boundary?: Coordinate[];
    initialCenter?: Coordinate;
    initialZoom?: number;
    editable?: boolean;
    onChange?: (polygon: Coordinate[], isValid: boolean) => void;
}

export const PolygonDraw: FunctionComponent<Props> = ({ polygon, boundary, initialCenter, initialZoom, editable = true, onChange }) => {
    const [selection, setSelection] = useState(initialState.selection);

    const handleDispatch = (action: Actions) => {
        const { polygon: updatedPolygon, selection: updatedSelection } = PolygonEditReducer({ selection, polygon }, action);
        if (selection !== updatedSelection) {
            setSelection(updatedSelection);
        }
        if (onChange && polygon !== updatedPolygon) {
            onChange(updatedPolygon, isValidPolygon(updatedPolygon));
        }
    };

    return (
        <Map
            selection={selection}
            editable={editable}
            initialCenter={initialCenter ? createLeafletLatLngTupleFromCoordinate(initialCenter) : MAP.DEFAULT_CENTER}
            initialZoom={initialZoom || MAP.DEFAULT_ZOOM}
            boundaryPolygonCoordinates={boundary || MAP.WORLD_COORDINATES}
            polygonCoordinates={polygon}
            dispatch={handleDispatch}
        />
    );
};
