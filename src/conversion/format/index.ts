import { geojson } from './geojson';
import { jts } from './jts';
import { latlng } from './latlng';
import { Format, FormatType } from './types';

export const format: Record<FormatType, Format> = {
    [FormatType.GEOJSON]: geojson,
    [FormatType.JTS]: jts,
    [FormatType.LATLNG]: latlng,
};
