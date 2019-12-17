import { Coordinate } from 'types';
import { isPolygonClosed } from '../helpers';

export const isValidPolygon = (coordinates: Coordinate[]) => coordinates && coordinates.length > 3 && isPolygonClosed(coordinates);
