declare module '@mapbox/geojsonhint' {
    type Hint = {
        line: number;
        message: string;
    };

    export function hint(
        value: any,
        options: {
            noDuplicateMembers?: boolean;
            precisionWarning?: boolean;
        }
    ): Hint[];
}
