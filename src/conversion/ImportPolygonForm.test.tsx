import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImportPolygonForm } from './ImportPolygonForm';

describe('ImportPolygonForm', () => {
    const getTextarea = (wrapper: RenderResult) => wrapper.getByRole('textbox') as HTMLInputElement;
    const getSubmitButton = (wrapper: RenderResult) => wrapper.getByText('Import');

    it('should initially display the empty state', async () => {
        const wrapper = render(<ImportPolygonForm />);
        await wrapper.findByText('Enter polygon coordinates');
    });

    it('should display the valid status when the entered polygon is valid GeoJSON', async () => {
        const wrapper = render(<ImportPolygonForm />);

        userEvent.type(
            getTextarea(wrapper),
            `{
               "type": "Polygon",
               "coordinates": [
                    [
                        [0, 0],
                        [1, 1],
                        [0, 1],
                        [0, 0]
                    ]
                ]
            }`,
            {
                allAtOnce: true
            }
        );

        await wrapper.findByText('GeoJSON. Valid data.');
    });

    it('should display the valid status when the entered polygon is valid GeoJSON', async () => {
        const wrapper = render(<ImportPolygonForm />);

        userEvent.type(getTextarea(wrapper), 'invalid GeoJSON', {
            allAtOnce: true
        });

        await wrapper.findByText('Invalid format');
    });

    it('should import the polygon when valid GeoJSON was pasted into the input', () => {
        const onSubmitMock = jest.fn();
        const wrapper = render(<ImportPolygonForm onSubmit={onSubmitMock} />);

        userEvent.type(
            getTextarea(wrapper),
            `{
               "type": "Polygon",
               "coordinates": [
                    [
                        [0, 0],
                        [1, 1],
                        [0, 1],
                        [0, 0]
                    ]
                ]
            }`,
            {
                allAtOnce: true
            }
        );

        userEvent.click(getSubmitButton(wrapper));

        expect(onSubmitMock).toHaveBeenCalledWith([
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 },
            { latitude: 1, longitude: 0 },
            { latitude: 0, longitude: 0 }
        ]);
    });

    it('should not import polygon when the GeoJSON is invalid', () => {
        const onSubmitMock = jest.fn();
        const wrapper = render(<ImportPolygonForm onSubmit={onSubmitMock} />);

        userEvent.type(getTextarea(wrapper), 'invalid GeoJSON', {
            allAtOnce: true
        });

        const submitBtn = getSubmitButton(wrapper);
        userEvent.click(submitBtn);

        expect(submitBtn).toBeDisabled();
        expect(onSubmitMock).not.toHaveBeenCalled();
    });
});
