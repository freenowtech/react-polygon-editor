import React from 'react';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';

import { LABELS } from '../constants';
import { ActionBar, Props } from './ActionBar';

afterAll(cleanup);
describe('ActionBar', () => {
    const props: Props = {
        onFocus: jest.fn(),
        onDelete: jest.fn(),
        onEnableVectorMode: jest.fn(),
        onExport: jest.fn(),
        onImport: jest.fn(),
        deleteInactive: true,
        editable: false,
        isVectorModeEnabled: false,
    };

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('WHEN editable is falsy', () => {
        beforeEach(() => render(<ActionBar {...props} />));

        it('should only render the action buttons', () => {
            expect(screen.getByText(LABELS.FOCUS)).toBeTruthy();
            expect(screen.queryByText(LABELS.EXPORT)).toBeTruthy();
            expect(screen.queryByText(LABELS.IMPORT)).toBeTruthy();
            expect(screen.queryByText(LABELS.DELETE)).toBeNull();
            expect(screen.queryByText(LABELS.PEN)).toBeNull();
        });

        it('should trigger the onFocus callback when user click the focus button', () => {
            fireEvent.click(screen.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });
    });

    describe('WHEN editable is truthy', () => {
        beforeEach(() => render(<ActionBar {...props} editable />));

        it('should render the actions', () => {
            expect(screen.getByText(LABELS.FOCUS)).toBeTruthy();
            expect(screen.getByText(LABELS.DELETE)).toBeTruthy();
            expect(screen.getByText(LABELS.PEN)).toBeTruthy();
        });

        it('should trigger the onFocus callback when user click the focus button', () => {
            fireEvent.click(screen.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });

        it('should trigger the onDelete callback when user click the focus button', () => {
            fireEvent.click(screen.getByText(LABELS.DELETE));

            expect(props.onDelete).toHaveBeenCalled();
        });

        it('should trigger the onEnableVectorMode callback when user click the focus button', () => {
            fireEvent.click(screen.getByText(LABELS.PEN));

            expect(props.onEnableVectorMode).toHaveBeenCalled();
        });
    });
});
