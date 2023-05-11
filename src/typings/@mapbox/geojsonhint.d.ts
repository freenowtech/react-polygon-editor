declare module '@mapbox/geojsonhint' {
    type Hint = {
        line: number;
        message: string;
    };

    export function hint(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: any,
        options: {
            noDuplicateMembers?: boolean;
            precisionWarning?: boolean;
        }
    ): Hint[];
}
