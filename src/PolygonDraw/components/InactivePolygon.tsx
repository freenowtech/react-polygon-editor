import { Coordinate } from '../../types';
import { Polygon } from '../Polygon';

interface Props {
    activePolygonIsClosed: boolean;
    index: number;
    isHighlighted: boolean;
    positions: Coordinate[];
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
}

export const InactivePolygon: React.FC<Props> = ({
    activePolygonIsClosed,
    isHighlighted,
    index,
    positions,
    onClick,
    onMouseEnter,
    onMouseLeave,
}) => {
    const eventHandler = {
        onClick: () => onClick && onClick(index),
        onMouseEnter: () => onMouseEnter && onMouseEnter(index),
        onMouseLeave: () => onMouseLeave && onMouseLeave(index),
    };

    return (
        <Polygon
            key={`${index}-${positions.reduce((acc, cur) => acc + cur.latitude + cur.longitude, 0)}`}
            coordinates={positions}
            isActive={false}
            isHighlighted={isHighlighted}
            {...(activePolygonIsClosed ? eventHandler : {})}
        />
    );
};
