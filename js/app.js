mapboxgl.accessToken = 'pk.eyJ1IjoiZG5zZW1pbmFyYSIsImEiOiJpcVhHYXQ4In0.11lnsgwtP94BZEDcZHZK2g';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.595, 45.589],
    zoom: 12
});

map.on('load', function () {

    map.addSource('neighborhood', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/c11815647b3949faa20b16cf50ab214d_125.geojson' });
    map.addLayer({
        "id": "neighborhood",
        "type": "fill",
        "source": "neighborhood",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });

    map.addSource('city-boundaries', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/470aa3de09244de4a3a94150b86a648b_10.geojson' });
    map.addLayer({
        "id": "city-boundaries",
        "type": "fill",
        "source": "city-boundaries",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#df6b6b',
            'fill-opacity': 0.8
        }
    });

    map.addSource('airlights', { 'type': 'geojson', 'data': 'data/PORT.elec_airfield_light.json' });
    map.addLayer({
        "id": "airlights",
        "type": "symbol",
        "source": "airlights",
        "layout": {
            "icon-image": "airfield-11",
            'visibility': 'none'
        }
    });

    map.addSource('snow-routes', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/902bba133844409e9307807e85c847a0_69.geojson' });
    map.addLayer({
        "id": "snow-routes",
        "type": "line",
        "source": "snow-routes",
        "layout": {
            "visibility": "visible",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#d4d437",
            "line-width": 3,
            "line-dasharray": [4,4],
        }
    });

});

var layers =
[
    {
        'name': 'City Boundaries',
        'source': 'city-boundaries',
        'directory': 'Community',
        'select': 'checkbox',
    },
    {
        'name': 'Snow Routes',
        'source': 'snow-routes',
        'directory': 'Environment',
        'select': 'checkbox',
    },
    {
        'name': 'Neighborhood',
        'source': 'neighborhood',
        'directory': 'Community',
        'select': 'checkbox',
    },
    {
        'name': 'Airlights',
        'source': 'airlights',
        'directory': 'Environment',
        'select': 'checkbox',
        'icon': 'icons/Electric-Airfield-Lights_15.svg'
    }

];

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new LayerTree({layers: layers}), 'bottom-left');
