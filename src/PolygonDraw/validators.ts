import { Coordinate } from 'types';
import { isPolygonClosed } from '../helpers';

export const isValidPolygon = (polygon: Coordinate[]) => (
    polygon &&
    polygon.length > 3 &&
    isPolygonClosed(polygon)
);
