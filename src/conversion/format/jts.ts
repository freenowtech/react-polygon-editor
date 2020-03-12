import { prettyPrint } from '../../common/helpers/prettyPrint';
import { Format, FormatType } from './types';

export const jts: Format = {
    name: FormatType.JTS,
    displayName: 'JTS',
    serialize: coordinates => {
        return prettyPrint(coordinates.map(({ longitude, latitude }) => [longitude, latitude]));
    },
    deserialize: raw => {
        throw new Error('not implemented');
    },
    validate: raw => {
        throw new Error('not implemented');
    }
};
