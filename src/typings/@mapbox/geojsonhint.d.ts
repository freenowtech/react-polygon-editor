declare module '@mapbox/geojsonhint' {
    export function hint(
        value: string,
        options: {
            noDuplicateMembers?: boolean;
            precisionWarning?: boolean;
        }): {
            line: number,
            message: string
        }[];
};