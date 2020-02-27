import React from 'react';
import styled from 'styled-components';

import { AUTHENTIC_BLUE_200, AUTHENTIC_BLUE_550, ACTION_BLUE_900 } from '../colors';
import { ChevronDownIcon } from './ChevronDownIcon';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
    id: string;
    label: string;
}

const Container = styled.div`
    box-sizing: border-box;
    display: inline-block;
    margin-bottom: 24px;
    position: relative;
`;

const Label = styled.label`
    background: white;
    color: ${AUTHENTIC_BLUE_550};
    font-size: 10px;
    left: 8px;
    transform: translateY(-50%);
    padding: 0 4px;
    position: absolute;
`;

const Input = styled.select`
    appearance: none;
    background: white;
    border: 1px solid ${AUTHENTIC_BLUE_200};
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    height: 48px;
    margin: 0;
    padding: 12px;
    transition: box-shadow 100ms, border 100ms;
    outline: none;
    width: 100%;

    &:active,
    &:focus {
        border-color: ${ACTION_BLUE_900};
        box-shadow: inset 0 0 0 1px ${ACTION_BLUE_900};
    }
`;

const SelectIcon = styled(ChevronDownIcon)`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
`;

// FIXME: label is missing an active state, should be same color as border
export const Select: React.FC<Props> = ({ children, id, label, ...props }) => {
    return (
        <Container>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...props}>
                {children}
            </Input>
            <SelectIcon />
        </Container>
    );
};
