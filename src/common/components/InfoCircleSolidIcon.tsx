import React from 'react';

import { AUTHENTIC_BLUE_900 } from '../colors';

interface Props {
    className?: string;
    color?: string;
}

export const InfoCircleSolidIcon: React.FC<Props> = ({ color = AUTHENTIC_BLUE_900, ...props }) => {
    return (
        <svg color={color} {...props} width={24} height={24} viewBox="0 0 24 24">
            <path
                d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm1 8.4h-2v6h2v-6zm-1-3.6a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"
                fill="currentColor"
                fillRule="nonzero"
            />
        </svg>
    );
};
