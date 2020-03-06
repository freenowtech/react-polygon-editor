import React, { SVGProps } from 'react';

import { AUTHENTIC_BLUE_900 } from '../../common/colors';

interface Props extends SVGProps<SVGSVGElement> {
    iconColor?: string;
}

export const Import: React.FC<Props> = ({ iconColor = AUTHENTIC_BLUE_900, ...props }) => (
    <svg viewBox="0 0 12 12" {...props}>
        <path fill={iconColor} d="M9.5 9.5v1h-7v-1h7zm-3-8v5.219L9 4.496v1.337L6 8.5 3 5.833V4.496l2.5 2.222V1.5h1z" />
    </svg>
);
