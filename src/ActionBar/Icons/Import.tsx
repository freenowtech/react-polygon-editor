import { AUTHENTIC_BLUE_900 } from '../../common/colors';
import { IconProps } from './types';

export const Import = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: IconProps): React.ReactElement => (
    <svg viewBox="0 0 24 24" {...props}>
        <path
            d="M19 19v2H5v-2h14zM12 3l6 5.333v2.675l-5-4.444V17h-2V6.564l-5 4.445V8.334L12 3z"
            fill={iconColor}
            fillRule="nonzero"
        />
    </svg>
);
