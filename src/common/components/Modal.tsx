import React, { useContext } from 'react';
import styled from 'styled-components';

import { AUTHENTIC_BLUE_1100 } from '../colors';
import { CloseIcon } from './CloseIcon';

const Dimming = styled.div`
    background-color: ${AUTHENTIC_BLUE_1100};
    height: 100%;
    left: 0;
    opacity: 0.6;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
`;

const TopRightCloseIcon = styled(CloseIcon)`
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    z-index: 1050;
`;

const Card = styled.div`
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    left: 50%;
    max-height: calc(100% - 16px);
    overflow: auto;
    padding: 40px;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 630px;
    z-index: 1050;
`;

type DismissFunc = () => void;

// tslint:disable-next-line: no-empty
const DismissContext = React.createContext<DismissFunc>(() => {});

export const useDismiss = () => useContext(DismissContext);

interface Props {
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ children, onClose }) => {
    const dismiss = () => {
        // hook (not a react hook) used for animations
        onClose();
    };

    return (
        <>
            <Dimming onClick={dismiss} />
            <Card>
                <TopRightCloseIcon onClick={dismiss} />
                <DismissContext.Provider value={dismiss}>{children}</DismissContext.Provider>
            </Card>
        </>
    );
};
