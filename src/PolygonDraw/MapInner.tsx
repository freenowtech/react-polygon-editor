import { LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";

type Props = {
    onClick: (event: LeafletMouseEvent) => void;
    onMouseDown: (event: LeafletMouseEvent) => void;
    onMouseUp: (event: LeafletMouseEvent) => void;
    onMouseMove: (event: LeafletMouseEvent) => void;
    onMouseOut: (event: LeafletMouseEvent) => void;
}

const MapInner = ({onClick, onMouseMove, onMouseOut}: Props) => {
    useMapEvents({
        click(event) {
            onClick(event)
        },
        mousedown(event) {
            onMouseOut(event)
        },
        mouseup(event) {
            onMouseOut(event)
        },
        mousemove(event) {
            onMouseMove(event)
        },
        mouseout(event) {
            onMouseOut(event)
        }
    });

    return null;
}

export default MapInner