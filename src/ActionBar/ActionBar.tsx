import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import { FREEDOM_RED_900 } from '../common/colors';

import { ActionButton, ActionButtonIcons } from './ActionButton';
import { LABELS } from '../constants';

const Container = styled.div`
    position: absolute;
    right: 0;
    bottom: 24px;
    display: flex;

    padding-right: 8px;
    padding-left: 8px;

    > * {
        margin-left: 8px;
    }
`;

export interface Props {
    editable: boolean;

    onFocus: () => void;

    onEnableVectorMode: () => void;
    isVectorModeEnabled: boolean;

    onDelete: () => void;
    deleteInactive: boolean;

    onExport: () => void;
}

export const ActionBar: FunctionComponent<Props> = ({ editable, deleteInactive, isVectorModeEnabled, onEnableVectorMode, onFocus, onDelete, onExport }) => (
    <Container>
        {editable &&
            <>
                <ActionButton
                    onClick={onEnableVectorMode}
                    icon={ActionButtonIcons.VECTOR_MODE}
                    inactive={!isVectorModeEnabled}
                >
                    {LABELS.PEN}
                </ActionButton>
                <ActionButton
                    onClick={onDelete}
                    icon={ActionButtonIcons.TRASHCAN}
                    activeIconColor={FREEDOM_RED_900}
                    disabled={deleteInactive}
                    inactive={deleteInactive}
                >
                    {LABELS.DELETE}
                </ActionButton>
            </>
        }
        <ActionButton onClick={onExport} icon={ActionButtonIcons.EXPORT}>
            {LABELS.EXPORT}
        </ActionButton>
        <ActionButton onClick={onFocus} icon={ActionButtonIcons.FRAME}>
            {LABELS.FOCUS}
        </ActionButton>
    </Container>
);

