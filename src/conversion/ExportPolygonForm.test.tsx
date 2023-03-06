import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { Coordinate } from '../types';
import { ExportPolygonForm } from './ExportPolygonForm';
import { FormatType } from './format/types';

const polygon: Coordinate[] = [
    { latitude: 0, longitude: 0 },
    { latitude: 1, longitude: 1 },
    { latitude: 1, longitude: 0 },
    { latitude: 0, longitude: 0 },
];

describe('ExportPolygonForm', () => {
    const getTextarea = () => screen.getByRole('textbox') as HTMLInputElement;

    describe('JTS', () => {
        it('should switch to JTS', () => {
            render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = screen.getByLabelText('Export format');

            fireEvent.change(formatSelect, { target: { value: FormatType.JTS } });

            expect(formatSelect).toHaveValue(FormatType.JTS);
            expect(getTextarea().value).toMatchInlineSnapshot(`
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
            render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = screen.getByLabelText('Export format');

            fireEvent.change(formatSelect, { target: { value: FormatType.GEOJSON } });

            expect(getTextarea().value).toBeValidGeoJSON();
            expect(getTextarea().value).toMatchInlineSnapshot(`
                "{
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "type": "Feature",
                      "properties": {},
                      "geometry": {
                        "type": "Polygon",
                        "coordinates": [
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
            render(<ExportPolygonForm polygon={polygon} onSubmit={jest.fn()} />);

            const formatSelect = screen.getByLabelText('Export format');
            fireEvent.change(formatSelect, { target: { value: FormatType.LATLNG } });

            expect(getTextarea().value).toMatchInlineSnapshot(`
                "[
                  {
                    "latitude": 0,
                    "longitude": 0
                  },
                  {
                    "latitude": 1,
                    "longitude": 1
                  },
                  {
                    "latitude": 1,
                    "longitude": 0
                  },
                  {
                    "latitude": 0,
                    "longitude": 0
                  }
                ]"
            `);
        });
    });
});
