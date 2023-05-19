import React from 'react';
import { render, screen } from '@testing-library/react';

import { MAP } from '../../constants';
import { Props, BaseMap } from './MapV2';
import { MOCK_POLYGON } from '../../mockPolygon';

jest.mock('react-leaflet', () => ({
    __esModule: true,
    MapContainer: React.forwardRef(() => <div />),
    Pane: React.forwardRef(() => <div />),
    useMap: jest.fn,
}));

describe('Map component', () => {
    let initialProps: Props;

    beforeEach(() => {
        initialProps = {
            activePolygonIndex: 0,
            boundaryPolygonCoordinates: MOCK_POLYGON,
            editable: true,
            initialCenter: MAP.DEFAULT_CENTER,
            initialZoom: MAP.DEFAULT_ZOOM,
            polygon: [MOCK_POLYGON],
            onChange: jest.fn(),
            onClick: jest.fn(),
            onMouseEnter: jest.fn(),
            onMouseLeave: jest.fn()
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('WHEN polygon is NOT disabled', () => {
        it('should NOT enable pen tool', () => {
            render(<BaseMap {...initialProps} editable={false} />);

            expect(screen.queryByText('Pen')).not.toBeInTheDocument();
        });
    });

    describe('WHEN polygon is disabled', () => {
        it('should enable pen tool', () => {
            render(<BaseMap {...initialProps} />);
            const editButton = screen.getByText('Pen');
            expect(editButton).toBeInTheDocument();
        });
    });
});
