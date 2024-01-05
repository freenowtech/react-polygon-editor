import { AUTHENTIC_BLUE_900 } from '../../common/colors';
import { IconProps } from './types';

export const Redo = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: IconProps): React.ReactElement => (
    <svg viewBox="0 0 24 24" height="1em" width="1em" {...props}>
        <path
            d="M9 18h3v-2H9c-1.654 0-3-1.346-3-3s1.346-3 3-3h6v3l5-4-5-4v3H9c-2.757 0-5 2.243-5 5s2.243 5 5 5z"
            fill={iconColor}
            fillRule="nonzero"
        />
    </svg>
);
