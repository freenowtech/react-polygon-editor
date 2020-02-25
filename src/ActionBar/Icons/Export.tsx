import React, { SVGProps } from 'react';

import { AUTHENTIC_BLUE_900 } from '../../common/colors';

interface Props extends SVGProps<SVGSVGElement> {
    iconColor?: string;
}

export const Export: React.FC<Props> = ({iconColor = AUTHENTIC_BLUE_900, ...props }) => (
    <svg viewBox="0 0 12 12" {...props}>
        <path fill={iconColor} d="M8.625 8.625v.75h-5.25v-.75h5.25zM6 2.625l2.25 2v1.003L6.375 3.961v3.914h-.75V3.962L3.75 5.629V4.625l2.25-2z" />
    </svg>
);
