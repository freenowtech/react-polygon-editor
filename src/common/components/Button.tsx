import styled, { css } from 'styled-components';

import { AUTHENTIC_BLUE_50, AUTHENTIC_BLUE_200, AUTHENTIC_BLUE_900, AUTHENTIC_BLUE_1100, WHITE } from '../colors';

export const Button = styled.button<{ secondary?: boolean }>`
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    height: 48px;
    font-size: 16px;
    min-width: 100px;
    padding: 0 16px;
    text-align: center;
    transition: background ease 216ms, border-color ease 216ms;

    ${({ secondary }) =>
        secondary
            ? css`
                  background: ${WHITE};
                  border-color: ${AUTHENTIC_BLUE_200};
                  color: ${AUTHENTIC_BLUE_900};

                  &:hover {
                      background: ${AUTHENTIC_BLUE_50};
                  }

                  &:disabled {
                      color: ${AUTHENTIC_BLUE_200};
                      background: ${WHITE};
                      border-color: ${AUTHENTIC_BLUE_200};
                  }
              `
            : css`
                  background: ${AUTHENTIC_BLUE_900};
                  border-color: ${AUTHENTIC_BLUE_900};
                  color: ${WHITE};

                  &:hover {
                      background: ${AUTHENTIC_BLUE_1100};
                      border-color: ${AUTHENTIC_BLUE_1100};
                  }

                  &:disabled {
                      color: ${WHITE};
                      background: ${AUTHENTIC_BLUE_200};
                      border-color: ${AUTHENTIC_BLUE_200};
                  }
              `}
`;
