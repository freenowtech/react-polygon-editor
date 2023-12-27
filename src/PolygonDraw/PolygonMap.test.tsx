import React from 'react';
import { render, screen } from '@testing-library/react';

import { MAP } from '../constants';
import { Props, PolygonMap } from './PolygonMap';
import { MOCK_POLYGON } from '../mockPolygon';

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
            activePolygon: MOCK_POLYGON,
            activePolygonIndex: 0,
            polygonCoordinates: [MOCK_POLYGON],
            boundaryPolygonCoordinates: MOCK_POLYGON,
            selection: new Set<number>(),
            editable: true,
            initialCenter: MAP.DEFAULT_CENTER,
            initialZoom: MAP.DEFAULT_ZOOM,
            isPolygonClosed: true,
            addPoint: jest.fn(),
            addPointToEdge: jest.fn(),
            addPointsToSelection: jest.fn(),
            deselectAllPoints: jest.fn(),
            removePointFromSelection: jest.fn(),
            selectPoints: jest.fn(),
            selectAllPoints: jest.fn(),
            moveSelectedPoints: jest.fn(),
            deletePolygonPoints: jest.fn(),
            setPolygon: jest.fn(),
            onUndo: jest.fn(),
            onRedo: jest.fn(),
            isRedoPossible: false,
            isUndoPossible: false
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('WHEN polygon is NOT disabled', () => {
        it('should NOT enable pen tool', () => {
            render(<PolygonMap {...initialProps} editable={false} />);

            expect(screen.queryByText('Pen')).not.toBeInTheDocument();
        });
    });

    describe('WHEN polygon is disabled', () => {
        it('should enable pen tool', () => {
            render(<PolygonMap {...initialProps} />);
            const editButton = screen.getByText('Pen');
            expect(editButton).toBeInTheDocument();
        });
    });
});
