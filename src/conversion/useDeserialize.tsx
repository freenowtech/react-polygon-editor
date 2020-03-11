import { useMemo } from 'react';

import { Coordinate } from 'types';

import { format } from './format';

type Result =
    | {
          valid: false;
      }
    | {
          valid: true;
          coordinates: Coordinate[];
      };

export const useDeserialize = (raw: string): Result => {
    return useMemo(() => {
        // the only format that is currently supported is GeoJSON
        const detectedFormat = format.geojson;

        return detectedFormat.validate(raw)
            ? { valid: true, coordinates: detectedFormat.deserialize(raw) }
            : { valid: false };
    }, [raw]);
};
