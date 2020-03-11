import React from 'react';

import { AUTHENTIC_BLUE_900 } from '../colors';

interface Props {
    className?: string;
    color?: string;
}

export const CheckCircleSolidIcon: React.FC<Props> = ({ color = AUTHENTIC_BLUE_900, ...props }) => {
    return (
        <svg color={color} {...props} width={24} height={24} viewBox="0 0 24 24">
            <path
                d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm3.898 6.293l-4.912 4.912-2.283-2.258-1.406 1.422 3.696 3.657 6.32-6.319-1.415-1.414z"
                fill="currentColor"
                fillRule="nonzero"
            />
        </svg>
    );
};
