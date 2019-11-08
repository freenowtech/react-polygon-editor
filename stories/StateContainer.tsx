import { Dispatch, ReactElement, SetStateAction, useState } from 'react';

interface Props<T extends {}> {
    children: (state: T, setState: Dispatch<SetStateAction<T>>) => ReactElement;
    initialState: T;
}

export const StateContainer = <T extends {}>({ children, initialState }: Props<T>) => {
    const [state, setState] = useState(initialState);
    return children(state, setState);
};
