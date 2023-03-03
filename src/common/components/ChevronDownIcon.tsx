import React from 'react';

import { AUTHENTIC_BLUE_900 } from '../colors';

interface Props {
    className?: string;
}

export const ChevronDownIcon: React.FC<Props> = (props) => {
    return (
        <svg color={AUTHENTIC_BLUE_900} width={24} height={24} viewBox="0 0 24 24" {...props}>
            <path d="M12 13.726l7-6.175v2.676l-7 6.222-7-6.222V7.55z" fill="currentColor" fillRule="nonzero" />
        </svg>
    );
};
