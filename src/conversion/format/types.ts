import { Coordinate } from 'types';

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
