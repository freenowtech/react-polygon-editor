import styled from 'styled-components';

import { ACTION_BLUE_900, AUTHENTIC_BLUE_550 } from '../colors';

export const Text = styled.p`
    color: ${AUTHENTIC_BLUE_550};
    font-size: 14px;
    margin-bottom: 24px;

    a,
    a:visited {
        color: ${ACTION_BLUE_900};
        font-weight: bold;
        text-decoration: none;
    }
`;
