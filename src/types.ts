import { ActionCreatorsMapObject } from 'redux';

export type Coordinate = {
    latitude: number;
    longitude: number;
};

export type Undo = {
    (): void;
    isPossible: boolean;
};

export type Redo = {
    (): void;
    isPossible: boolean;
};
export interface Action<T extends string> {
    type: T;
}

export interface ActionWithPayload<T extends string, P> extends Action<T> {
    payload: P;
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;

export interface RectangleSelection {
    startPosition: Coordinate;
    endPosition: Coordinate;
    startTime: number;
}
