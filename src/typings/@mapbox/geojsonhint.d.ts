declare module '@mapbox/geojsonhint' {
    type Hint = {
        line: number;
        message: string;
    };

    export function hint(
        // tslint:disable-next-line:no-any
        value: any,
        options: {
            noDuplicateMembers?: boolean;
            precisionWarning?: boolean;
        }
    ): Hint[];
}
