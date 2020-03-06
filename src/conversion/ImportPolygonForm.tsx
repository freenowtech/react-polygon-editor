import React, { FormEventHandler, useState } from 'react';
import styled from 'styled-components';

import { Coordinate } from 'types';

import { Button } from '../common/components/Button';
import { ButtonGroup } from '../common/components/ButtonGroup';
import { Headline } from '../common/components/Headline';
import { Textarea } from '../common/components/Textarea';
import { useDismiss } from '../common/components/Modal';
import { useDeserialize } from './useDeserialize';

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const StyledTextarea = styled(Textarea)`
    margin-bottom: 24px;
`;

interface Props {
    onSubmit: (coordinates: Coordinate[]) => void;
}

export const ImportPolygonForm: React.FC<Props> = ({ onSubmit }) => {
    const dismiss = useDismiss();
    const [text, setText] = useState('');
    const deserialized = useDeserialize(text);

    const handleOnSubmit: FormEventHandler = e => {
        e.preventDefault();

        if (deserialized.valid) {
            onSubmit(deserialized.coordinates);
            dismiss();
        }
    };

    return (
        <Form onSubmit={handleOnSubmit}>
            <Headline>Import Polygon</Headline>
            <StyledTextarea placeholder="Insert code here" value={text} onChange={e => setText(e.target.value)} />
            <ButtonGroup>
                <Button type="submit" disabled={!deserialized.valid}>
                    Import
                </Button>
                <Button type="button" secondary onClick={dismiss}>
                    Close
                </Button>
            </ButtonGroup>
        </Form>
    );
};
