import styled from 'styled-components';

import { Map as LeafletMap } from 'react-leaflet';

export const Map = styled(LeafletMap)`
    height: 100%;
    width: 100%;
    z-index: 0;

    cursor: ${({ drawCursor }: { drawCursor: boolean }) => drawCursor ? 'crosshair !important' : 'auto'};
`;

export const Container = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
`;
