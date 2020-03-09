import React from 'react';

import { AUTHENTIC_BLUE_900 } from '../colors';

interface Props {
    className?: string;
    color?: string;
}

export const CloseCircleSolidIcon: React.FC<Props> = ({ color = AUTHENTIC_BLUE_900, ...props }) => {
    return (
        <svg color={color} {...props} width={24} height={24} viewBox="0 0 24 24">
            <path
                d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm2.364 6l-2.475 2.474L9.414 8 8 9.414l2.474 2.475L8 14.364l1.414 1.414 2.475-2.475 2.475 2.475 1.414-1.414-2.475-2.475 2.475-2.475L14.364 8z"
                fill="currentColor"
                fillRule="nonzero"
            />
        </svg>
    );
};
