import React from 'react';
import styled from 'styled-components';

import { AUTHENTIC_BLUE_900, AUTHENTIC_BLUE_200, ACTION_BLUE_900, WHITE } from '../common/colors';

import { Frame } from './Icons/Frame';
import { Trashcan } from './Icons/Trashcan';
import { VectorMode } from './Icons/VectorMode';
import { Export } from './Icons/Export';

export enum ActionButtonIcons {
    TRASHCAN = 'TRASHCAN',
    FRAME = 'FRAME',
    VECTOR_MODE = 'VECTOR_MODE',
    EXPORT = 'EXPORT'
}

interface ContainerProps {
    disabled?: boolean;
}
const Container = styled('div')<ContainerProps>`
    position: relative;
    width: 42px;
    height: 42px;

    padding-top: 6px;
    border-radius: 4px;

    text-align: center;
    font-size: 10px;
    font-weight: 600;
    color: ${AUTHENTIC_BLUE_900};
    background-color: ${WHITE};
    border: solid ${AUTHENTIC_BLUE_200} 1px;

    box-shadow: inherit;
    transition: 0.2s;

    user-select: none;
    cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer' };

    &:hover {
        transform: scale(1.005);
        box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.16);
        z-index: 1;
    }
`;

const renderIcon = (icon: ActionButtonIcons, inactive?: boolean, activeIconColor = ACTION_BLUE_900) => {
    const props = {
        iconColor: inactive ? AUTHENTIC_BLUE_200 : activeIconColor,
        width: 16,
        height: 16
    };

    switch (icon) {
        case ActionButtonIcons.TRASHCAN:
            return <Trashcan {...props} />;
        case ActionButtonIcons.FRAME:
            return <Frame {...props} />;
        case ActionButtonIcons.VECTOR_MODE:
            return <VectorMode {...props} />;
        case ActionButtonIcons.EXPORT:
            return <Export {...props} />;
        default:
            return null;
    }
};

export interface Props {
    icon: ActionButtonIcons;
    onClick: () => void;

    inactive?: boolean;
    disabled?: boolean;
    activeIconColor?: string;
    className?: string;
}
export const ActionButton: React.FunctionComponent<Props> = ({ icon, children, inactive, activeIconColor, ...props }) => {
    return (
        <Container {...props}>
            <div>
                {renderIcon(icon, inactive, activeIconColor)}
            </div>
            {children}
        </Container>
    );
};
