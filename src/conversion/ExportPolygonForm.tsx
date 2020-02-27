import React, { FormEventHandler, useState, useMemo, ChangeEventHandler } from 'react';
import styled from 'styled-components';

import { Button } from '../common/components/Button';
import { ButtonGroup } from '../common/components/ButtonGroup';
import { Headline } from '../common/components/Headline';
import { useDismiss } from '../common/components/Modal';
import { Select } from '../common/components/Select';
import { Textarea } from '../common/components/Textarea';
import { Text } from '../common/components/Text';
import { Coordinate } from '../types';
import { format } from './format';

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

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
        <Form onSubmit={handleOnSubmit}>
            <Headline>Export Polygon</Headline>
            <Select
                id="fn-export-format-select"
                label="Export format"
                value={outputFormat.name}
                onChange={handleOutputFormatChanged}
            >
                <option value={format.geojson.name}>GeoJSON</option>
                <option value={format.latlng.name}>LatLng</option>
            </Select>
            {outputFormat.description && <Text dangerouslySetInnerHTML={{ __html: outputFormat.description }} />}
            <Textarea value={value} readOnly />
            <ButtonGroup>
                <Button type="submit">Copy code</Button>
                <Button secondary onClick={dismiss}>
                    Close
                </Button>
            </ButtonGroup>
        </Form>
    );
};
