mapboxgl.accessToken = '';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-122.595, 45.589],
    zoom: 10,
    attributionControl: false,
});

map.on('load', function () {

    map.addSource('neighborhood', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/c11815647b3949faa20b16cf50ab214d_125.geojson' });
    map.addLayer({
        "id": "neighborhood",
        "type": "fill",
        "source": "neighborhood",
        "layout": {
            "visibility": 'none'
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

    map.addSource('snowy', { type: 'geojson', data: 'http://gis.pdx.opendata.arcgis.com/datasets/902bba133844409e9307807e85c847a0_69.geojson' });
    map.addLayer({
        "id": "snow-routes",
        "type": "line",
        "source": "snowy",
        "layout": {
            "visibility": "none",
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#d4d437",
            "line-width": 3,
            "line-dasharray": [4,4],
        }
    });

    map.addSource('airy', {
        'type': 'geojson',
        'data': 'data/PORT.elec_airfield_light.json'
    });

    map.addLayer({
        "id": "airlights",
        "type": "symbol",
        "source": "airy",
        "layout": {
            "icon-image": "Electric-Airfield-Lights_11",
            'visibility': 'visible'
        }
    });
    map.setFilter('airlights', ['==', 'airfield_light_type_cd', 'Runway Edge Light']);

    map.addLayer({
        "id": "act-twy-edge",
        "type": "symbol",
        "source": "airy",
        "layout": {
            "icon-image": "active-twy-edge_11",
            'visibility': 'visible'
        }
    });
    map.setFilter('act-twy-edge', ['==', 'airfield_light_type_cd', 'Taxiway Edge Light']);

    map.addLayer({
        "id": "act-twy-center",
        "type": "symbol",
        "source": "airy",
        "layout": {
            "icon-image": "active-twy-center_15",
            'visibility': 'visible'
        }
    });
    map.setFilter('act-twy-center', ['==', 'airfield_light_type_cd', 'Taxiway Centerline L852c Light']);

});

var layers =
[
    {
        'name': 'City Boundaries',
        'id': 'city-boundaries',
        'source': 'city-boundaries',
        'directory': 'Metro',
    },
    {
        'name': 'Snow Routes',
        'id': 'snow-routes',
        'source': "snowy",
        'directory': 'Community',
    },
    {
        'name': 'Neighborhood',
        'id': 'neighborhood',
        'source': "neighborhood",
        'directory': 'Community',
    },
    {
        'name': 'Airlights',
        'id': 'airlights',
        'source': "airy",
        'directory': 'Environment',
        'icon': 'icons/Electric-Airfield-Lights_15.svg'
    },
    {
        'name': 'Act Twy Edge',
        'id': 'act-twy-edge',
        'source': "airy",
        'directory': 'Environment',
        'icon': 'icons/active-twy-edge_15.svg'
    },
    {
        'name': 'Act Twy Center',
        'id': 'act-twy-center',
        'source': "airy",
        'directory': 'Environment',
        'icon': 'icons/active-twy-center_11.svg'
    }

];

var basemaps =
[
    {
        'name': 'Streets',
        'id': 'streets',
        'source': 'mapbox://styles/mapbox/streets-v9',
        'directory': 'Base Maps',
    },
    {
        'name': 'Basic',
        'id': 'basic',
        'source': 'mapbox://styles/mapbox/basic-v9',
        'directory': 'Base Maps',
    },
    {
        'name': 'Bright',
        'id': 'bright',
        'source': 'mapbox://styles/mapbox/light-v9',
        'directory': 'Base Maps',
    }

];

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new LayerTree({layers: layers, basemaps: basemaps}), 'bottom-left');
