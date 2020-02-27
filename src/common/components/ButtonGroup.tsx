import styled from 'styled-components';

export const ButtonGroup = styled.div`
    display: flex;

    & > button:not(:last-child) {
        margin-right: 8px;
    }
`;
