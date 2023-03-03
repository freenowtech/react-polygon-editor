import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';

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
        it('should only render the action buttons', () => {
            const wrapper = render(<ActionBar {...props} />);
            expect(wrapper.getByText(LABELS.FOCUS)).toBeTruthy();
            expect(wrapper.queryByText(LABELS.DELETE)).toBeNull();
            expect(wrapper.queryByText(LABELS.PEN)).toBeNull();
        });

        it('should trigger the onFocus callback when user click the focus button', () => {
            const wrapper = render(<ActionBar {...props} />);
            fireEvent.click(wrapper.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });
    });

    describe('WHEN editable is truthy', () => {
        it('should render the actions', () => {
            const wrapper = render(<ActionBar {...props} editable />);
            expect(wrapper.getByText(LABELS.FOCUS)).toBeTruthy();
            expect(wrapper.getByText(LABELS.DELETE)).toBeTruthy();
            expect(wrapper.getByText(LABELS.PEN)).toBeTruthy();
        });

        it('should trigger the onFocus callback when user click the focus button', () => {
            const wrapper = render(<ActionBar {...props} editable />);
            fireEvent.click(wrapper.getByText(LABELS.FOCUS));

            expect(props.onFocus).toHaveBeenCalled();
        });

        it('should trigger the onDelete callback when user click the focus button', () => {
            const wrapper = render(<ActionBar {...props} editable />);
            fireEvent.click(wrapper.getByText(LABELS.DELETE));

            expect(props.onDelete).toHaveBeenCalled();
        });

        it('should trigger the onEnableVectorMode callback when user click the focus button', () => {
            const wrapper = render(<ActionBar {...props} editable />);
            fireEvent.click(wrapper.getByText(LABELS.PEN));

            expect(props.onEnableVectorMode).toHaveBeenCalled();
        });
    });
});
