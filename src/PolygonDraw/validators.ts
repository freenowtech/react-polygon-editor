import { Coordinate } from 'types';
import { isPolygonClosed } from '../helpers';

export const isValidPolygon = (coordinates: Coordinate[]): boolean =>
    !!coordinates && coordinates.length > 3 && isPolygonClosed(coordinates);
