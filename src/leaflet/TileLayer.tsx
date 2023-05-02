import { TileLayer as LeafletTileLayer } from 'react-leaflet';

import { LEAFLET } from '../constants';

export const TileLayer = () => (
    <LeafletTileLayer
        attribution={'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}
        url={LEAFLET.TILE_SERVER_URL}
    />
);
