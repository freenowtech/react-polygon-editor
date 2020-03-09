import React, { ReactNode } from 'react';
import styled from 'styled-components';

import {
    AUTHENTIC_BLUE_50,
    ACTION_BLUE_900,
    NEGATIVE_ORANGE_50,
    NEGATIVE_ORANGE_900,
    POSITIVE_GREEN_50,
    POSITIVE_GREEN_900
} from '../common/colors';
import { CheckCircleSolidIcon } from '../common/components/CheckCircleSolidIcon';
import { CloseCircleSolidIcon } from '../common/components/CloseCircleSolidIcon';
import { InfoCircleSolidIcon } from '../common/components/InfoCircleSolidIcon';
import { Text } from '../common/components/Text';

export const enum Status {
    EMPTY,
    VALID,
    INVALID
}

const Container = styled.div<{ status: Status }>`
    background-color: ${({ status }) => {
        switch (status) {
            case Status.EMPTY:
                return AUTHENTIC_BLUE_50;
            case Status.VALID:
                return POSITIVE_GREEN_50;
            case Status.INVALID:
                return NEGATIVE_ORANGE_50;
        }
    }};
    border-radius: 8px;
    display: flex;
    margin-bottom: 24px;
    padding: 8px;
`;

const ContentWrapper = styled.div`
    margin-left: 8px;
`;

const Title = styled(Text)`
    font-weight: bold;
`;

const Description = styled(Text)`
    font-size: 12px;
`;

interface Props {
    status: Status;
}

export const ImportPolygonStatus: React.FC<Props> = ({ status }) => {
    let data: {
        title: string;
        description: string;
        icon: ReactNode;
    };

    switch (status) {
        case Status.EMPTY: {
            data = {
                title: 'Enter polygon coordinates',
                description: 'Only GeoJSON is supported at the moment.',
                icon: <InfoCircleSolidIcon color={ACTION_BLUE_900} />
            };
            break;
        }
        case Status.VALID: {
            data = {
                title: 'Format detected',
                description: 'GeoJSON. Valid data.',
                icon: <CheckCircleSolidIcon color={POSITIVE_GREEN_900} />
            };
            break;
        }
        case Status.INVALID: {
            data = {
                title: 'Invalid format',
                description: 'For more information about the supported format please follow this link:',
                icon: <CloseCircleSolidIcon color={NEGATIVE_ORANGE_900} />
            };
            break;
        }
    }

    return (
        <Container status={status}>
            {data.icon}
            <ContentWrapper>
                <Title>{data.title}</Title>
                <Description>{data.description}</Description>
            </ContentWrapper>
        </Container>
    );
};
