import { FunctionComponent } from 'react';
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
    deleteInactive: boolean;
    editable: boolean;
    isRedoable: boolean;
    isUndoable: boolean;
    isVectorModeEnabled: boolean;
    onDelete: () => void;
    onEnableVectorMode: () => void;
    onExport: () => void;
    onFocus: () => void;
    onImport: () => void;
    onRedo: () => void;
    onUndo: () => void;
}

export const ActionBar: FunctionComponent<Props> = ({
    deleteInactive,
    editable,
    isRedoable,
    isUndoable,
    isVectorModeEnabled,
    onDelete,
    onEnableVectorMode,
    onExport,
    onFocus,
    onImport,
    onRedo,
    onUndo,
}) => (
    <Container>
        <ActionButton onClick={onUndo} icon={ActionButtonIcons.IMPORT} disabled={!isUndoable} inactive={!isUndoable}>
            undo
        </ActionButton>
        <ActionButton onClick={onRedo} icon={ActionButtonIcons.EXPORT} disabled={!isRedoable} inactive={!isRedoable}>
            redo
        </ActionButton>
        {editable && (
            <>
                <ActionButton
                    onClick={onEnableVectorMode}
                    icon={ActionButtonIcons.VECTOR_MODE}
                    inactive={!isVectorModeEnabled}
                    aria-label={`${isVectorModeEnabled ? 'Disable Editing' : 'Enable Editing'}`}
                >
                    {LABELS.PEN}
                </ActionButton>
                <ActionButton
                    onClick={onDelete}
                    icon={ActionButtonIcons.TRASHCAN}
                    activeIconColor={FREEDOM_RED_900}
                    disabled={deleteInactive}
                    inactive={deleteInactive}
                    aria-label="Delete"
                >
                    {LABELS.DELETE}
                </ActionButton>
            </>
        )}
        <ActionButton onClick={onImport} icon={ActionButtonIcons.IMPORT}>
            {LABELS.IMPORT}
        </ActionButton>
        <ActionButton onClick={onExport} icon={ActionButtonIcons.EXPORT}>
            {LABELS.EXPORT}
        </ActionButton>
        <ActionButton onClick={onFocus} icon={ActionButtonIcons.FRAME}>
            {LABELS.FOCUS}
        </ActionButton>
    </Container>
);
