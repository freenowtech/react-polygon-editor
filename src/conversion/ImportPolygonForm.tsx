import React, { FormEventHandler } from 'react';
import styled from 'styled-components';

import { Coordinate } from 'types';

import { Headline } from '../common/components/Headline';

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

interface Props {
    onSubmit: (coordinates: Coordinate[]) => void;
}

export const ImportPolygonForm: React.FC<Props> = ({ onSubmit }) => {
    const handleOnSubmit: FormEventHandler = e => {
        e.preventDefault();

        // TODO pass real coordinates
        onSubmit([]);
    };

    return (
        <Form onSubmit={handleOnSubmit}>
            <Headline>Import Polygon</Headline>
        </Form>
    );
};
