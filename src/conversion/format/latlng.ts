import { prettyPrint } from '../../common/helpers/prettyPrint';
import { Format, FormatType } from './types';

export const latlng: Format = {
    name: FormatType.LATLNG,
    displayName: 'LatLng',
    serialize: (coordinates) => {
        return prettyPrint(coordinates);
    },
    deserialize: (raw) => {
        throw new Error('not implemented');
    },
    validate: (raw) => {
        throw new Error('not implemented');
    },
};
