import { Coordinate } from '../../types';
import { Polygon } from './Polygon';

interface Props {
    index: number;
    coordinates: Coordinate[][];
    onClick?: (index: number) => void;
    onMouseEnter?: (index: number) => void;
    onMouseLeave?: (index: number) => void;
}

export const ActivePolygon: React.FC<Props> = ({ index, onClick, onMouseEnter, onMouseLeave, coordinates }) => (
    <Polygon
        coordinates={coordinates[index]}
        isActive
        isHighlighted={false}
        onClick={() => onClick && onClick(index)}
        onMouseEnter={() => onMouseEnter && onMouseEnter(index)}
        onMouseLeave={() => onMouseLeave && onMouseLeave(index)}
    />
);
