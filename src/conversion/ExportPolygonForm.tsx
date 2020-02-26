import React, { FormEventHandler, useState, useMemo, ChangeEventHandler } from 'react';

import { useDismiss } from '../common/components/Modal';
import { Coordinate } from '../types';
import { format } from './format';

interface Props {
    polygon: Coordinate[];
    onSubmit: (value: string) => void;
}

export const ExportPolygonForm: React.FC<Props> = ({ polygon, onSubmit }) => {
    const dismiss = useDismiss();

    const [outputFormat, setOutputFormat] = useState(format.geojson);

    const value = useMemo(() => outputFormat.serialize(polygon), [polygon, outputFormat.serialize]);

    const handleOutputFormatChanged: ChangeEventHandler<HTMLSelectElement> = e => {
        setOutputFormat(format[e.target.value]);
    };

    const handleOnSubmit: FormEventHandler = e => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <form onSubmit={handleOnSubmit}>
            <h2>Export Polygon</h2>
            <label htmlFor="fn-export-format-select">Export format</label>
            <select id="fn-export-format-select" value={outputFormat.name} onChange={handleOutputFormatChanged}>
                <option value={format.geojson.name}>GeoJSON</option>
                <option value={format.latlng.name}>LatLng</option>
            </select>
            <textarea value={value} readOnly />
            <button type="submit">Copy code</button>
            <button onClick={dismiss}>Close</button>
        </form>
    );
};
