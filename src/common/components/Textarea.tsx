import styled from 'styled-components';

import { AUTHENTIC_BLUE_200 } from '../colors';

export const Textarea = styled.textarea`
    appearance: none;
    background: white;
    border: 1px solid ${AUTHENTIC_BLUE_200};
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    min-height: 200px;
    padding: 12px 12px 0;
    resize: none;
    transition: box-shadow 100ms, border 100ms;
    outline: none;
    white-space: pre;
    width: 100%;
`;
