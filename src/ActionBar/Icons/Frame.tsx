import { AUTHENTIC_BLUE_900 } from '../../common/colors';
import { IconProps } from './types';

export const Frame = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: IconProps): React.ReactElement => (
    <svg width={24} height={24} viewBox="0 0 24 24" {...props}>
        <path
            fill={iconColor}
            d="M0 8V4a4 4 0 0 1 4-4h4v2H4a2 2 0 0 0-2 2v4H0zm0 8h2v4c0 1.1.9 2 2 2h4v2H4a4 4 0 0 1-4-4v-4zm24-8h-2V4a2 2 0 0 0-2-2h-4V0h4a4 4 0 0 1 4 4v4zm0 8v4a4 4 0 0 1-4 4h-4v-2h4a2 2 0 0 0 2-2v-4h2z"
        />
    </svg>
);
