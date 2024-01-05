import { AUTHENTIC_BLUE_900 } from '../../common/colors';
import { IconProps } from './types';

export const Trashcan = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: IconProps): React.ReactElement => (
    <svg width={24} height={24} viewBox="4 4 19 19" {...props}>
        <path
            fill={iconColor}
            d="M8.8 19.4c0 .9.6 1.6 1.4 1.6h6c.7 0 1.4-.7 1.4-1.6V10H8.8v9.4zm9.9-12.7h-2.8l-.8-1h-3.9l-.8 1H7.7V9h11V6.7z"
        />
    </svg>
);
