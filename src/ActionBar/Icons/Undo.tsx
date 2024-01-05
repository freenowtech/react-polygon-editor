import { AUTHENTIC_BLUE_900 } from '../../common/colors'
import { IconProps } from './types'

export const Undo = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: IconProps): React.ReactElement => (
    <svg viewBox="0 0 24 24" height="1em" width="1em" {...props}>
        <path
            d="M9 10h6c1.654 0 3 1.346 3 3s-1.346 3-3 3h-3v2h3c2.757 0 5-2.243 5-5s-2.243-5-5-5H9V5L4 9l5 4v-3z"
            fill={iconColor}
            fillRule="nonzero"
        />
    </svg>
);
