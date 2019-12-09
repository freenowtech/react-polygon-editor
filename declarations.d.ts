declare module 'leaflet-geometryutil' {
    import { LatLng, Map } from 'leaflet';
    
    interface Snapped {
        distance: number;
        latlng: LatLng;
        layer: LatLng[];
    }
    
    export const distance: (map: Map, latLngA: LatLng, latLngB: LatLng) => number;
    export const closest: (map: Map, layers: LatLng[] | LatLng[][], latlng: LatLng, vertices?: boolean) => LatLng | null;
    export const closestLayerSnap: (map: Map, layers: LatLng[][], latlng: LatLng, tolerance?: number | null, withVertices?: boolean) => Snapped | null;
}