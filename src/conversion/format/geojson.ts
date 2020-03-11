import type { GeoJSON, Polygon } from 'geojson';
import rewind from '@mapbox/geojson-rewind';
import geojsonhint, { Hint } from '@mapbox/geojsonhint';

import { Coordinate } from 'types';

import { prettyPrint } from '../../common/helpers/prettyPrint';
import { Format, FormatType } from './types';

const serialize = (coordinates: Coordinate[]): string => {
    const geoJSON: GeoJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates.map(({ longitude, latitude }) => [longitude, latitude])]
                }
            }
        ]
    };

    return prettyPrint(geoJSON);
};

const ALLOWED_GEOJSON_GEOMETRY_TYPES = ['Polygon'];
const ALLOWED_GEOJSON_TYPES = ['FeatureCollection', 'Feature', ...ALLOWED_GEOJSON_GEOMETRY_TYPES];

const getErrors = (value: unknown): Hint[] => {
    return geojsonhint.hint(value, {
        precisionWarning: false
    });
};

const acceptGeoJSON = (value: unknown): value is GeoJSON => {
    return getErrors(rewind(value as GeoJSON)).length === 0;
};

const getCoordinatesFromPolygon = (polygon: Polygon): Coordinate[] => {
    return polygon.coordinates[0].map(([longitude, latitude]) => ({ longitude, latitude }));
};

const deserialize = (raw: string): Coordinate[] => {
    const parsed = JSON.parse(raw);

    if (!acceptGeoJSON(parsed)) {
        throw new Error(
            `Invalid GeoJSON detected:\n${getErrors(parsed).map(error => `- ${error.message}\n`)}`
        );
    }

    switch (parsed.type) {
        case 'Feature': {
            const geometry = parsed.geometry;
            if (geometry.type !== 'Polygon') {
                throw new Error(`Geometry type ${geometry.type} is not supported, must be one of ${ALLOWED_GEOJSON_GEOMETRY_TYPES}`);
            }
            return getCoordinatesFromPolygon(geometry);
        }
        case 'FeatureCollection': {
            const geometry = parsed.features[0].geometry;
            if (geometry.type !== 'Polygon') {
                throw new Error(`Geometry type ${geometry.type} is not supported, must be one of ${ALLOWED_GEOJSON_GEOMETRY_TYPES}`);
            }
            return getCoordinatesFromPolygon(geometry);
        }
        case 'Polygon': {
            const polygon = parsed;
            return getCoordinatesFromPolygon(polygon);
        }
        default: {
            throw new Error(`Type ${parsed.type} is not supported, must be one of ${ALLOWED_GEOJSON_TYPES}`);
        }
    }
};

const validate = (raw: string): boolean => {
    try {
        deserialize(raw);
        return true;
    } catch (e) {
        return false;
    }
};

export const geojson: Format = {
    name: FormatType.GEOJSON,
    displayName: 'GeoJSON',
    description: `GeoJSON is a format for encoding a variety of geographic data structures. <a href="https://geojson.org/" target="_blank">More info</a>`,
    serialize,
    deserialize,
    validate
};
