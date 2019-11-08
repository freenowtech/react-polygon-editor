import React from 'react';
import { render, cleanup, fireEvent, RenderResult } from '@testing-library/react';
import { MOCK_POLYGON } from '../mockPolygon';
import { actions } from './actions';
import { Props as MapProps } from './Map';
import { PolygonDraw, Props } from './PolygonDraw';

jest.mock('./Map.tsx', () => ({ dispatch, polygonCoordinates }: MapProps) => (
        <>
            <pre data-testid="polygon">{JSON.stringify(polygonCoordinates)}</pre>
            <button onClick={() => dispatch(actions.changePolygon([MOCK_POLYGON[0]]))}>changePolygon</button>
            <button onClick={() => dispatch(actions.selectPoints([0, 1]))}>changeSelection</button>
        </>
    ));

afterAll(cleanup);
describe('PolygonDraw', () => {

    const props: Props = {
        editable: true,
        onChange: jest.fn(),
        boundary: [],
        polygon: []
    };

    let wrapper: RenderResult;

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should ONLY trigger the onChange callback when polygon changes', () => {
        wrapper = render(<PolygonDraw {...props} />);
        fireEvent.click(wrapper.getByText('changePolygon'));
        expect(props.onChange).toHaveBeenCalledWith([MOCK_POLYGON[0]], false);
        expect(wrapper.getByTestId('polygon').textContent).toEqual('[]');
    });

    it('should NOT trigger the onChange callback when selection changes', async () => {
        wrapper = render(<PolygonDraw {...props} />);
        fireEvent.click(wrapper.getByText('changeSelection'));

        expect(props.onChange).not.toHaveBeenCalled();
    });
});
