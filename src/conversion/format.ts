import type { GeoJSON } from 'geojson';

import { Coordinate } from '../types';

// tslint:disable-next-line: no-any
const prettyPrint = (value: any) => JSON.stringify(value, null, 2);

export enum FormatType {
    GEOJSON = 'geojson',
    LATLNG = 'latlng',
    JTS = 'jts'
}

export interface Format {
    name: FormatType;
    displayName: string;
    description?: string;
    serialize: (coordinates: Coordinate[]) => string;
    deserialize: (raw: string) => Coordinate[];
    validate: (value: string) => boolean;
}

export const format: Record<FormatType, Format> = {
    [FormatType.JTS]: {
        name: FormatType.JTS,
        displayName: 'JTS',
        serialize: coordinates => {
            return prettyPrint(coordinates.map(({ longitude, latitude }) => [longitude, latitude]));
        },
        deserialize: (raw: string) => {
            throw new Error('not implemented');
        },
        validate: (value: string) => {
            throw new Error('not implemented');
        }
    },
    [FormatType.GEOJSON]: {
        name: FormatType.GEOJSON,
        displayName: 'GeoJSON',
        description: `GeoJSON is a format for encoding a variety of geographic data structures. <a href="https://geojson.org/" target="_blank">More info</a>`,
        serialize: coordinates => {
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
        },
        deserialize: (raw: string) => {
            throw new Error('not implemented');
        },
        validate: (value: string) => {
            throw new Error('not implemented');
        }
    },
    [FormatType.LATLNG]: {
        name: FormatType.LATLNG,
        displayName: 'LatLng',
        serialize: coordinates => {
            return prettyPrint(coordinates);
        },
        deserialize: (raw: string) => {
            throw new Error('not implemented');
        },
        validate: (value: string) => {
            throw new Error('not implemented');
        }
    }
};
