import type { GeoJSON } from 'geojson';

import { Coordinate } from '../types';

// tslint:disable-next-line: no-any
const prettyPrint = (value: any) => JSON.stringify(value, null, 2);

export enum FormatType {
    GEOJSON = 'geojson',
    LATLNG = 'latlng'
}

export interface Format {
    name: FormatType;
    serialize: (coordinates: Coordinate[]) => string;
    deserialize: (raw: string) => Coordinate[];
    validate: (value: string) => boolean;
}

export const format: Record<FormatType, Format> = {
    [FormatType.GEOJSON]: {
        name: FormatType.GEOJSON,
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
            throw new Error('not implemented yet');
        },
        validate: (value: string) => {
            throw new Error('not implemented yet');
        }
    },
    [FormatType.LATLNG]: {
        name: FormatType.LATLNG,
        serialize: coordinates => {
            return prettyPrint(coordinates.map(({ longitude, latitude }) => [longitude, latitude]));
        },
        deserialize: (raw: string) => {
            throw new Error('not implemented yet');
        },
        validate: (value: string) => {
            throw new Error('not implemented yet');
        }
    }
};
