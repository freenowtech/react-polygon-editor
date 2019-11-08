import 'leaflet/dist/leaflet.css';
import { configure } from '@storybook/react';

const req = require.context('../stories', true, /story.tsx$/);

function loadStories() {
    req.keys().forEach(req);
}

configure(loadStories, module);
