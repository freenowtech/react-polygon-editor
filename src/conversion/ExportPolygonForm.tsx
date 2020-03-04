import React, { FormEventHandler, useState, useMemo, ChangeEventHandler } from 'react';
import styled from 'styled-components';

import { Export } from '../ActionBar/Icons/Export';
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
    align-items: center;
    background-color: ${AUTHENTIC_BLUE_1100};
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    height: 200px;
    justify-content: center;
    margin-bottom: calc(24px - 200px);
    position: relative;
    opacity: 0;
    top: -200px;
    transition: opacity 0.1s linear;

    &:hover {
        background-color: ${AUTHENTIC_BLUE_1100};
        opacity: 0.6;
    }
`;

const CopyOverlayLabel = styled.p`
    color: ${WHITE};
    font-size: 16px;
`;

const CopyTextarea = styled(Textarea)`
    height: 200px;
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

            <CopyTextarea value={value} readOnly />
            <CopyOverlay>
                <Export iconColor={WHITE} height={48} width={48} />
                <CopyOverlayLabel>Copy to clipboard</CopyOverlayLabel>
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
