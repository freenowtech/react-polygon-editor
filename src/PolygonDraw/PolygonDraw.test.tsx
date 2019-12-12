const POLYGON_ONE = [
    { longitude: 10.204147696495056, latitude: 53.354382476941005 },
    { longitude: 10.204142332077025, latitude: 53.35428482109631 },
    { longitude: 10.204254984855652, latitude: 53.35427681650897 },
    { longitude: 10.204254984855652, latitude: 53.3543760732859 },
    { longitude: 10.204147696495056, latitude: 53.354382476941005 }
];

const POLYGON_TWO = [
    { longitude: 9.994758367538452, latitude: 53.445905921775484 },
    { longitude: 9.994584023952484, latitude: 53.44581965809418 },
    { longitude: 9.994693994522095, latitude: 53.4457477715593 },
    { longitude: 9.994860291481018, latitude: 53.44583243790988 },
    { longitude: 9.994758367538452, latitude: 53.445905921775484 }
];

const POLYGON_THREE = [
    { longitude: 10.000393688678741, latitude: 53.60418178358681 },
    { longitude: 10.00032126903534, latitude: 53.60410698227261 },
    { longitude: 10.000506341457365, latitude: 53.60404013843292 },
    { longitude: 10.000602900981903, latitude: 53.604110165309955 },
    { longitude: 10.000393688678741, latitude: 53.60418178358681 }
];

describe('PolygonDraw', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test.todo('passing a list of polygons renders all of them');
    test.todo('passing a list of polygons and a highlighted index will render all polygons and one');
});
