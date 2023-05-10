import { Action, ActionWithPayload } from './types';

export function createAction<T extends string>(type: T): Action<T> {
    return { type };
}
export function createActionWithPayload<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P> {
    return { type, payload };
}
