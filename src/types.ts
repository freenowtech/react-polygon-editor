import { ActionCreatorsMapObject } from 'redux';

export type Coordinate = {
    latitude: number,
    longitude: number
};

export interface Action<T extends string> {
    type: T;
}

export interface ActionWithPayload<T extends string, P> extends Action<T> {
    payload: P;
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;

