import React from 'react';
import { render, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
            expect(screen.getByText(LABELS.EXPORT)).toBeTruthy();
            expect(screen.getByText(LABELS.IMPORT)).toBeTruthy();
            expect(screen.queryByText(LABELS.DELETE)).toBeNull();
            expect(screen.queryByText(LABELS.PEN)).toBeNull();
        });

        it('should trigger the onFocus callback when user click the focus button', async () => {
            await userEvent.click(screen.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });

        it('should trigger the onExport callback when the user clicks the export button', async () => {
            await userEvent.click(screen.getByText(LABELS.EXPORT));

            expect(props.onExport).toHaveBeenCalled();
        });

        it('should trigger the onImport callback when the user clicks the import button', async () => {
            await userEvent.click(screen.getByText(LABELS.IMPORT));

            expect(props.onImport).toHaveBeenCalled();
        });
    });

    describe('WHEN editable is truthy', () => {
        beforeEach(() => render(<ActionBar {...props} editable />));

        it('should render the actions', () => {
            expect(screen.getByText(LABELS.FOCUS)).toBeTruthy();
            expect(screen.getByText(LABELS.DELETE)).toBeTruthy();
            expect(screen.getByText(LABELS.PEN)).toBeTruthy();
        });

        it('should trigger the onFocus callback when user click the focus button', async () => {
            await userEvent.click(screen.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });

        it('should trigger the onDelete callback when user click the focus button', async () => {
            await userEvent.click(screen.getByText(LABELS.DELETE));

            expect(props.onDelete).toHaveBeenCalled();
        });

        it('should trigger the onEnableVectorMode callback when user click the focus button', async () => {
            await userEvent.click(screen.getByText(LABELS.PEN));

            expect(props.onEnableVectorMode).toHaveBeenCalled();
        });

        it('should trigger the onExport callback when the user clicks the export button', async () => {
            await userEvent.click(screen.getByText(LABELS.EXPORT));

            expect(props.onExport).toHaveBeenCalled();
        });

        it('should trigger the onImport callback when the user clicks the import button', async () => {
            await userEvent.click(screen.getByText(LABELS.IMPORT));

            expect(props.onImport).toHaveBeenCalled();
        });
    });

    describe('WHEN isVectorModeEnabled has different states', () => {
        it('should render the Pen action button activ WHEN isVectorModeEnabled is truthy', () => {
            render(<ActionBar {...props} editable isVectorModeEnabled />);

            expect(screen.getByLabelText('Disable Editing')).toBeInTheDocument();
            expect(screen.queryByLabelText('Enable Editing')).not.toBeInTheDocument();

            const penButtonSvgPath = screen.getByText('Pen').children[0].children[0].children[0] as HTMLElement;

            // activ color = ACTION_BLUE_900
            expect(penButtonSvgPath.getAttribute('fill')).toBe('#096bdb');
        });

        it('should render the Pen action button activ WHEN isVectorModeEnabled is falsy', () => {
            render(<ActionBar {...props} editable isVectorModeEnabled={false} />);

            const penButtonSvgPath = screen.getByText('Pen').children[0].children[0].children[0] as HTMLElement;

            // inactive color = AUTHENTIC_BLUE_200
            expect(penButtonSvgPath.getAttribute('fill')).toBe('#c6cdd4');

            expect(screen.getByLabelText('Enable Editing')).toBeInTheDocument();
            expect(screen.queryByLabelText('Disable Editing')).not.toBeInTheDocument();
        });
    });

    describe('WHEN deleteInactive is truthy', () => {
        it('should render the Delete action button with inactive icon color', () => {
            render(<ActionBar {...props} editable deleteInactive />);

            const deleteButtonSvgPath = screen.getByText('Delete').children[0].children[0].children[0] as HTMLElement;

            expect(screen.getByText('Delete')).toHaveAttribute('disabled');

            // inactive color = AUTHENTIC_BLUE_200
            expect(deleteButtonSvgPath.getAttribute('fill')).toBe('#c6cdd4');
        });
    });

    describe('WHEN deleteInactive is falsy', () => {
        it('should render the Delete action button with red icon', () => {
            render(<ActionBar {...props} editable deleteInactive={false} />);

            const deleteButtonSvgPath = screen.getByText('Delete').children[0].children[0].children[0] as HTMLElement;
            expect(screen.queryByText('Delete')).not.toHaveAttribute('disabled');

            // active color = FREEDOM_RED_900
            expect(deleteButtonSvgPath.getAttribute('fill')).toBe('#ff0a2b');
        });
    });
});
