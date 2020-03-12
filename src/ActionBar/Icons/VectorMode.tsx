import React, { FunctionComponent, SVGProps } from 'react';

import { AUTHENTIC_BLUE_900 } from '../../common/colors';

interface Props extends SVGProps<SVGSVGElement> {
    iconColor?: string;
}

export const VectorMode: FunctionComponent<Props> = ({ iconColor = AUTHENTIC_BLUE_900, ...props }: Props) => (
    <svg width={24} height={24} viewBox="0 0 24 24" {...props}>
        <path
            fill={iconColor}
            d="M15 13.2v7.4l-14.3 3 3-14.3H11l3.9 3.9zm-9.4-1.6l-2 9 9-1.9v-7.1h-7zm13.8 3a3.5 3.5 0 0 1-5 0l-4.8-5a3.5 3.5 0 0 1 0-4.8l4-4.1 9.8 9.8-4 4zm-11.5 0a1.2 1.2 0 1 1 1.7 1.6 1.2 1.2 0 0 1-1.7-1.6z"
        />
    </svg>
);
