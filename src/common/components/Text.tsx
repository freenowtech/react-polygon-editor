import styled from 'styled-components';

import { ACTION_BLUE_900, AUTHENTIC_BLUE_550, AUTHENTIC_BLUE_1100 } from '../colors';

interface Props {
    weak?: boolean;
}

export const Text = styled.p<Props>`
    color: ${({ weak }) => (weak ? AUTHENTIC_BLUE_550 : AUTHENTIC_BLUE_1100)};
    font-size: 14px;

    a,
    a:visited {
        color: ${ACTION_BLUE_900};
        font-weight: bold;
        text-decoration: none;
    }
`;
