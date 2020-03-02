import React, { FormEventHandler, useState, useMemo, ChangeEventHandler } from 'react';
import styled from 'styled-components';

import { Button } from '../common/components/Button';
import { ButtonGroup } from '../common/components/ButtonGroup';
import { Headline } from '../common/components/Headline';
import { useDismiss } from '../common/components/Modal';
import { Select } from '../common/components/Select';
import { Textarea } from '../common/components/Textarea';
import { Text } from '../common/components/Text';
import { AUTHENTIC_BLUE_1100, WHITE } from '../common/colors';
import { Coordinate } from '../types';
import { format } from './format';

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const CopyOverlay = styled.div`
    background-color: ${AUTHENTIC_BLUE_1100}00;
    border-radius: 4px;
    cursor: pointer;
    height: 200px;
    margin-bottom: 24px;
    position: relative;
    transition: background-color 0.1s linear;

    &:hover {
        background-color: ${AUTHENTIC_BLUE_1100}99;
    }
`;

const CopyOverlayContent = styled.div`
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
`;

const CopyOverlayLabel = styled.span`
    color: ${WHITE};
    font-size: 16px;
`;

const CopyTextarea = styled(Textarea)`
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    z-index: -1;
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

            <CopyOverlay>
                <CopyOverlayContent>
                    <CopyOverlayLabel>Copy to clipboard</CopyOverlayLabel>
                </CopyOverlayContent>
                <CopyTextarea value={value} readOnly />
            </CopyOverlay>

            <ButtonGroup>
                <Button type="submit">Copy code</Button>
                <Button secondary onClick={dismiss}>
                    Close
                </Button>
            </ButtonGroup>
        </Form>
    );
};
