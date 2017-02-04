mapboxgl.accessToken = 'pk.eyJ1IjoiZG5zZW1pbmFyYSIsImEiOiJpcVhHYXQ4In0.11lnsgwtP94BZEDcZHZK2g';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.595, 45.589],
    zoom: 12
});

map.on('load', function () {
    map.addSource('Neighborhood', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/c11815647b3949faa20b16cf50ab214d_125.geojson' });
    map.addLayer({
        "id": "Neighborhood",
        "type": "fill",
        "source": "Neighborhood",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });

    map.addSource('City Boundaries', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/470aa3de09244de4a3a94150b86a648b_10.geojson' });
    map.addLayer({
        "id": "City Boundaries",
        "type": "fill",
        "source": "City Boundaries",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#df6b6b',
            'fill-opacity': 0.8
        }
    });
});

var layers =
[
    {
        'source': 'Neighborhood',
        'directory': 'Environment',
        'select': 'checkbox',
    },
    {
        'source': 'City Boundaries',
        'directory': 'Construction',
        'select': 'checkbox',
    }
];

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new LayerTree({layers: layers}), 'bottom-left');
