declare module '@mapbox/geojson-rewind' {
    import { GeoJSON } from 'geojson';

    export default function rewind(geojson: GeoJSON, clockwise: boolean = false): GeoJSON;
}
