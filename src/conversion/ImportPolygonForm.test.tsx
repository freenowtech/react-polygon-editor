import { fireEvent, render, screen } from '@testing-library/react';

import { ImportPolygonForm } from './ImportPolygonForm';

describe('ImportPolygonForm', () => {
    it('should initially display the empty state', () => {
        render(<ImportPolygonForm />);

        expect(screen.queryByText('Enter polygon coordinates')).toBeInTheDocument();
    });

    it('should display the valid status when the entered polygon is valid GeoJSON', () => {
        render(<ImportPolygonForm />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: {
                value: `{
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
            },
        });

        expect(screen.queryByText('GeoJSON. Valid data.')).toBeInTheDocument();
    });

    it('should display the valid status when the entered polygon is invalid GeoJSON', () => {
        render(<ImportPolygonForm />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'invalid GeoJSON' },
        });

        expect(screen.queryByText('Invalid format')).toBeInTheDocument();
    });

    it('should import the polygon when valid GeoJSON was pasted into the input', () => {
        const onSubmitMock = jest.fn();
        render(<ImportPolygonForm onSubmit={onSubmitMock} />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: {
                value: `{
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
            },
        });

        fireEvent.submit(screen.getByRole('form'));

        expect(onSubmitMock).toHaveBeenCalledWith([
            { latitude: 0, longitude: 0 },
            { latitude: 1, longitude: 1 },
            { latitude: 1, longitude: 0 },
            { latitude: 0, longitude: 0 },
        ]);
    });

    it('should not import polygon when the GeoJSON is invalid', () => {
        const onSubmitMock = jest.fn();
        render(<ImportPolygonForm onSubmit={onSubmitMock} />);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'invalid GeoJSON' },
        });

        const submitButton = screen.getByText('Import');
        fireEvent.click(submitButton);

        expect(submitButton).toBeDisabled();
        expect(onSubmitMock).not.toHaveBeenCalled();
    });
});
