import { LeafletMouseEvent } from 'leaflet';
import { useMapEvents } from 'react-leaflet';

type Props = {
    onClick: (event: LeafletMouseEvent) => void;
    onMouseDown: (event: LeafletMouseEvent) => void;
    onMouseUp: (event: LeafletMouseEvent) => void;
    onMouseMove: (event: LeafletMouseEvent) => void;
    onMouseOut: (event: LeafletMouseEvent) => void;
};

const MapInner = ({ onClick, onMouseMove, onMouseOut }: Props) => {
    useMapEvents({
        click: onClick,
        mousedown: onMouseOut,
        mouseup: onMouseOut,
        mousemove: onMouseMove,
        mouseout: onMouseOut,
    });

    return null;
};

export default MapInner;
