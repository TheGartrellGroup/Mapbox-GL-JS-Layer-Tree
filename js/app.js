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

    map.addSource('bikes', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/470aa3de09244de4a3a94150b86a648b_10.geojson' });
    map.addLayer({
        "id": "bikes",
        "type": "circle",
        "source": "bikes",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            "circle-radius": 5,
            "circle-color": "#d4d437"
        }
    });

});

var layers =
[
    {
        'name': 'City Boundaries',
        'source': 'city-boundaries',
        'directory': 'Environment',
        'select': 'checkbox',
    },
    {
        'name': 'Bikes',
        'source': 'bikes',
        'directory': 'Environment',
        'select': 'checkbox',
    },
    {
        'name': 'Neighborhood',
        'source': 'neighborhood',
        'directory': 'Environment',
        'select': 'checkbox',
    }

];

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new LayerTree({layers: layers}), 'bottom-left');
