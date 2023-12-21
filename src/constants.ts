import { ACTION_BLUE_900, FREEDOM_RED_900, AUTHENTIC_BLUE_550, WHITE, AUTHENTIC_BLUE_350 } from './common/colors';
import { LatLngTuple } from 'leaflet';

export const LABELS = {
    PEN: 'Pen',
    DELETE: 'Delete',
    FOCUS: 'Focus',
    EXPORT: 'Export',
    IMPORT: 'Import',
    REDO: 'Redo',
    UNDO: 'Undo',
};

export const LEAFLET = {
    TILE_SERVER_URL: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

export const MAP = {
    POLYGON_ACTIVE_COLOR: ACTION_BLUE_900,
    RECTANGLE_SELECTION_COLOR: AUTHENTIC_BLUE_350,
    POLYGON_INACTIVE_COLOR: AUTHENTIC_BLUE_550,
    VERTEX_FILL_COLOR: WHITE,
    BOUNDARY_COLOR: AUTHENTIC_BLUE_550,
    ERROR_BOUNDARY_COLOR: FREEDOM_RED_900,
    BORDER_WIDTH: 2,

    DEFAULT_CENTER: [53.397, 10.4] as LatLngTuple,
    DEFAULT_ZOOM: 12,

    /**
     * This defines a polygon that encompasses the whole world. It can be used to
     * make an subtractive effect if you lay over another polygon. See boundary
     * polygon.
     */
    WORLD_LAT_LNG_COORDINATES: [
        { lat: -85.1054596961173, lng: -180 },
        { lat: 85.1054596961173, lng: -180 },
        { lat: 85.1054596961173, lng: 180 },
        { lat: -85.1054596961173, lng: 180 },
        { lat: -85.1054596961173, lng: 0 },
    ],

    WORLD_COORDINATES: [
        { latitude: -85.1054596961173, longitude: -180 },
        { latitude: 85.1054596961173, longitude: -180 },
        { latitude: 85.1054596961173, longitude: 180 },
        { latitude: -85.1054596961173, longitude: 180 },
        { latitude: -85.1054596961173, longitude: 0 },
    ],
};
