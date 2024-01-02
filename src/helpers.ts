import { LatLng, LatLngBounds, LatLngTuple } from 'leaflet';

import { Coordinate } from './types';

export const createLeafletLatLngTupleFromCoordinate = (coordinate: Coordinate): LatLngTuple => [
    coordinate.latitude,
    coordinate.longitude,
];

export const createLeafletLatLngBoundsFromCoordinates = (coordinates: Coordinate[]) =>
    new LatLngBounds(coordinates.map(createLeafletLatLngTupleFromCoordinate));

export const createLeafletLatLngFromCoordinate = (coordinate: Coordinate) =>
    new LatLng(coordinate.latitude, coordinate.longitude);

export const createCoordinateFromLeafletLatLng = (latLng: LatLng): Coordinate => ({
    latitude: latLng.lat,
    longitude: latLng.lng,
});

export const addCoordinates = (coordA: Coordinate, coordB: Coordinate): Coordinate => ({
    latitude: coordA.latitude + coordB.latitude,
    longitude: coordA.longitude + coordB.longitude,
});

export const subtractCoordinates = (coordA: Coordinate, coordB: Coordinate): Coordinate => ({
    latitude: coordA.latitude - coordB.latitude,
    longitude: coordA.longitude - coordB.longitude,
});

export const isPolygonClosed = (coordinates: Coordinate[]): boolean =>
    coordinates && coordinates.length > 2 && isSameCoordinate(coordinates[0], coordinates[coordinates.length - 1]);

export const isClosingPointsSelected = (coordinates: Coordinate[], selection: Set<number>): boolean =>
    isPolygonClosed(coordinates) && (selection.has(coordinates.length - 1) || selection.has(0));

// https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
export const isCoordinateInPolygon = (coordinate: Coordinate, polygon: Coordinate[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const intersect =
            polygon[i].longitude > coordinate.longitude !== polygon[j].longitude > coordinate.longitude &&
            coordinate.latitude <
                ((polygon[j].latitude - polygon[i].latitude) * (coordinate.longitude - polygon[i].longitude)) /
                    (polygon[j].longitude - polygon[i].longitude) +
                    polygon[i].latitude;
        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
};

export const movePolygonCoordinates = (
    polygon: Coordinate[],
    selectedCoordinates: Set<number>,
    moveVector: Coordinate
) => {
    const selection = new Set([...selectedCoordinates]);

    if (isClosingPointsSelected(polygon, selection)) {
        selection.add(0);
        selection.add(polygon.length - 1);
    }

    return polygon.map((coord, index) => {
        if (selection.has(index)) {
            return addCoordinates(coord, moveVector);
        } else {
            return coord;
        }
    });
};

const isSameCoordinate = (firstCoordinate: Coordinate, secondCoordinate: Coordinate) =>
    firstCoordinate.latitude === secondCoordinate.latitude &&
    firstCoordinate.longitude === secondCoordinate.longitude;

export const removeSelectedPoints = (polygonCoordinates: Coordinate[], selectedPoints: Set<number>) => {
    const newPolygonCoordinates = polygonCoordinates.filter((polygonCoordinate, index) => !selectedPoints.has(index));
    const isOldPathClosed =
        polygonCoordinates.length > 1 &&
        isSameCoordinate(polygonCoordinates[0], polygonCoordinates[polygonCoordinates.length - 1]);
    const isNewPathClosed =
        newPolygonCoordinates.length > 1 &&
        isSameCoordinate(newPolygonCoordinates[0], newPolygonCoordinates[newPolygonCoordinates.length - 1]);

    // Open closed path if it has 3 points or less
    if (newPolygonCoordinates.length < 4 && isNewPathClosed) {
        newPolygonCoordinates.shift();
    }

    // Remove closing points if either of them was removed
    if (isOldPathClosed) {
        if (selectedPoints.has(0) && !selectedPoints.has(polygonCoordinates.length - 1)) {
            newPolygonCoordinates.pop();
        }
        if (!selectedPoints.has(0) && selectedPoints.has(polygonCoordinates.length - 1)) {
            newPolygonCoordinates.shift();
        }
    }

    // Close previously closed path if it has 3 points or more
    if (isOldPathClosed && !isNewPathClosed && newPolygonCoordinates.length > 2) {
        newPolygonCoordinates.push({ ...newPolygonCoordinates[0] });
    }

    return newPolygonCoordinates;
};

export const getCenterCoordinate = (coordA: Coordinate, coordB: Coordinate): Coordinate => ({
    latitude: (coordA.latitude + coordB.latitude) / 2,
    longitude: (coordA.longitude + coordB.longitude) / 2,
});

// Returns the center coordinates of the polygon edges
export const getPolygonEdges = (polygon: Coordinate[]) =>
    polygon.reduce<Coordinate[]>((edges, coordinate, index) => {
        if (index === 0 || isSameCoordinate(polygon[index], polygon[index - 1])) {
            return edges;
        }
        edges.push(getCenterCoordinate(polygon[index], polygon[index - 1]));
        return edges;
    }, []);

export const isPolygonList = (polygons: Coordinate[] | Coordinate[][]): polygons is Coordinate[][] => {
    return Array.isArray(polygons[0]);
};

// Always returns a list of polygons from a single or multiple polygons
export const ensurePolygonList = (polygons: Coordinate[] | Coordinate[][]): Coordinate[][] => {
    if (polygons.length === 0) {
        return [[]];
    }

    if (isPolygonList(polygons)) {
        // we have to cast here because ts can not infer the type from Array.isArray
        return polygons;
    }

    // we have to cast here because ts can not infer the type from Array.isArray
    return [polygons];
};
