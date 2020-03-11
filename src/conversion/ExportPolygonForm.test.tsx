import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Coordinate } from '../types';
import { ExportPolygonForm } from './ExportPolygonForm';
import { FormatType } from './format/types';

const polygon: Coordinate[] = [
    { latitude: 0, longitude: 0 },
    { latitude: 1, longitude: 1 },
    { latitude: 1, longitude: 0 },
    { latitude: 0, longitude: 0 }
];

describe('ExportPolygonForm', () => {
    const getFormatSelect = (wrapper: RenderResult) => wrapper.getByLabelText('Export format');
    const getTextarea = (wrapper: RenderResult) => wrapper.getByRole('textbox') as HTMLInputElement;

    describe('JTS', () => {
        it('should switch to JTS', () => {
            const wrapper = render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = getFormatSelect(wrapper);
            userEvent.selectOptions(formatSelect, FormatType.JTS);

            expect(formatSelect).toHaveValue(FormatType.JTS);
            expect(getTextarea(wrapper).value).toMatchInlineSnapshot(`
                "[
                  [
                    0,
                    0
                  ],
                  [
                    1,
                    1
                  ],
                  [
                    0,
                    1
                  ],
                  [
                    0,
                    0
                  ]
                ]"
            `);
        });
    });

    describe('GeoJSON', () => {
        it('should be selected by default', () => {
            const wrapper = render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = getFormatSelect(wrapper);
            userEvent.selectOptions(formatSelect, FormatType.GEOJSON);

            expect(getTextarea(wrapper).value).toBeValidGeoJSON();
            expect(getTextarea(wrapper).value).toMatchInlineSnapshot(`
                "{
                  \\"type\\": \\"FeatureCollection\\",
                  \\"features\\": [
                    {
                      \\"type\\": \\"Feature\\",
                      \\"properties\\": {},
                      \\"geometry\\": {
                        \\"type\\": \\"Polygon\\",
                        \\"coordinates\\": [
                          [
                            [
                              0,
                              0
                            ],
                            [
                              1,
                              1
                            ],
                            [
                              0,
                              1
                            ],
                            [
                              0,
                              0
                            ]
                          ]
                        ]
                      }
                    }
                  ]
                }"
            `);
        });
    });

    describe('LatLng', () => {
        it('should change format to LatLng', () => {
            const wrapper = render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = getFormatSelect(wrapper);
            userEvent.selectOptions(formatSelect, FormatType.LATLNG);

            expect(getTextarea(wrapper).value).toMatchInlineSnapshot(`
"[
  {
    \\"latitude\\": 0,
    \\"longitude\\": 0
  },
  {
    \\"latitude\\": 1,
    \\"longitude\\": 1
  },
  {
    \\"latitude\\": 1,
    \\"longitude\\": 0
  },
  {
    \\"latitude\\": 0,
    \\"longitude\\": 0
  }
]"
`);
        });
    });
});
