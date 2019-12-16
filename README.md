# @freenow/react-polygon-editor

### Table of contents

-   About
-   Getting started
-   Components
-   How to run locally
-   Contribution

### About

React Polygon Editor provides react components for displaying and editing polygons.
We use leaflet for rendering maps. And typescript to provide a strongly typed interface.

### Getting started

First install @freenow/react-polygon-editor:

```bash
npm i -S @freenow/react-polygon-editor
```

Make sure you have also installed all peer dependencies. Have a look at [package.json](package.json) for more information.

inject the leaflet css style.

```typescript
Import 'leaflet/dist/leaflet.css';
```

You can also link the css style from a CDN in your index.html

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css" />
```

### Components

##### PolygonDraw

**Props**

-   **polygon**: _Coordinate[] | Coordinate[][]_ (Single or list of polygons to render)
-   **activeIndex**?: _number_ (index of currently active polygon, can be omitted when only one polygon exists. **Default value: 0**)
-   **boundary**?: _Coordinate[]_
-   **initialCenter**?: _Coordinate_ (The initial center will be used to localize the map on the first render if no polygon or boundary polygon were provided)
-   **initialZoom**?: _number_ (The initial zoom will be used to localize the map on the first render if no polygon or boundary polygon were provided)
-   **editable**?: _boolean_ (Allows enabling and disabling polygon editing. **Default value: true**)
-   **onChange**?: _(polygonCoordinates: Coordinate[], isValid: boolean) => void_
-   **onClick**?: _(index: number) => void_ (called with the index of the polygon that was clicked on)
-   **onMouseEnter**?: _(index: number) => void_ (called with the index of the polygon that was entered)
-   **onMouseLeave**?: _(index: number) => void_ (called with the index of the polygon that was left)

The initialCenter and initialZoom props are applicable only when both the polygon and the boundary coordinates are empty.
This flow explains which parameters are used to focus the map:

![Focus flow](map_focus_flow.png)

For more details, have a look at the Component definition in [PolygonDraw](src/PolygonDraw/PolygonDraw.tsx)

### How to run locally

You can run the library locally. We use [storybook](https://storybook.js.org/) to illustrate what can be done with the components.

Simply run:

```bash
npm i && npm start
```

### Contribution

1. Discuss the contribution with the maintainers
2. Make sure the the code is well tested and adheres to code convention
3. Create a pull request
