import React, { SVGProps } from 'react';

import { AUTHENTIC_BLUE_900 } from '../../common/colors';

interface Props extends SVGProps<SVGSVGElement> {
    iconColor?: string;
}

export const Export: React.FC<Props> = ({ iconColor = AUTHENTIC_BLUE_900, ...props }) => (
    <svg viewBox="0 0 24 24" {...props}>
        <path
            d="M19 19v2H5v-2h14zM13 3v10.436l5-4.445v2.676L12 17l-6-5.333V8.991l5 4.445V3h2z"
            fill={iconColor}
            fillRule="nonzero"
        />
    </svg>
);
