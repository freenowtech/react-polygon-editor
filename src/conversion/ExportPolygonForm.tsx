import React, { FormEventHandler, useState, useMemo, ChangeEventHandler } from 'react';
import styled, { css, keyframes } from 'styled-components';

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

const Description = styled(Text).attrs(() => ({ weak: true }))`
    margin-bottom: 24px;
`;

const rippleAnimation = keyframes`
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 0.4;
    }
    100% {
        opacity: 0.6;
    }
`;

const CopyOverlay = styled.div<{ isActive: boolean }>`
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

    ${({ isActive }) =>
        isActive
            ? css`
                  animation: ${rippleAnimation} 0.4s ease-out;
              `
            : ''}

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
    const [copyButtonClicked, setCopyButtonClicked] = useState(false);
    const [copyOverlayIsActive, setCopyOverlayIsActive] = useState(false);
    const [copyOverlayClicked, setCopyOverlayClicked] = useState(false);
    const dismiss = useDismiss();

    const [outputFormat, setOutputFormat] = useState(format.geojson);

    const value = useMemo(() => outputFormat.serialize(polygon), [polygon, outputFormat.serialize]);

    const handleOutputFormatChanged: ChangeEventHandler<HTMLSelectElement> = e => {
        setOutputFormat(format[e.target.value]);
    };

    const handleCopyOverlayClicked = () => {
        if (!copyOverlayClicked) {
            setCopyOverlayIsActive(true);
            setCopyOverlayClicked(true);
            setTimeout(() => setCopyOverlayClicked(false), 1000);
            onSubmit(value);
        }
    };

    const handleOnSubmit: FormEventHandler = e => {
        e.preventDefault();

        if (!copyButtonClicked) {
            setCopyButtonClicked(true);
            setTimeout(() => setCopyButtonClicked(false), 1000);
        }

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
                {Object.values(format).map(f => (
                    <option key={f.name} value={f.name}>
                        {f.displayName}
                    </option>
                ))}
            </Select>

            {outputFormat.description && <Description dangerouslySetInnerHTML={{ __html: outputFormat.description }} />}

            <CopyTextarea value={value} readOnly />
            <CopyOverlay
                isActive={copyOverlayIsActive}
                onClick={handleCopyOverlayClicked}
                onAnimationEnd={() => setCopyOverlayIsActive(false)}
            >
                <Export iconColor={WHITE} height={48} width={48} />
                <CopyOverlayLabel>{copyOverlayClicked ? 'Copied!' : 'Copy to clipboard'}</CopyOverlayLabel>
            </CopyOverlay>

            <ButtonGroup>
                <Button>{copyButtonClicked ? 'Copied!' : 'Copy code'}</Button>
                <Button type="button" secondary onClick={dismiss}>
                    Close
                </Button>
            </ButtonGroup>
        </Form>
    );
};
