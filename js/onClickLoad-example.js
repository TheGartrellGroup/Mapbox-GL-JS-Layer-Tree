mapboxgl.accessToken = '';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-75, 15],
    zoom: 2
});


var emptyGJ = {
    'type': 'FeatureCollection',
    'features': []
};

map.on('load', function() {

    map.addSource('geo-regions', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "geo-regions",
        "type": "fill",
        "source": "geo-regions",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'fill-color': '#4842f4',
            'fill-opacity': 0.3
        }
    });

    map.addSource('land', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "land",
        "type": "fill",
        "source": "land",
        "layout": {
            "visibility": 'none'
        },
        "paint": {
            'fill-color': '#e0d4b8',
            'fill-opacity': 0.8
        }
    });

    map.addSource('glacial', { type: 'geojson', data: emptyGJ });
    map.addLayer({
        "id": "glaciers",
        "type": "fill",
        "source": "glacial",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#b8dae0',
            'fill-opacity': 1
        }
    });

})


var layers =

    [{
        'name': 'Geographic Regions',
        'id': 'geo-regions',
        'source': 'geo-regions',
        'path': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_geography_regions_polys.geojson',
        'directory': 'Misc',
    }, {
        'name': 'Land',
        'id': 'land',
        'source': 'land',
        'path': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
        'directory': 'Natural',
    }, {
        'name': 'Glaciers',
        'id': 'glaciers',
        'source': 'glacial',
        'path': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_glaciated_areas.geojson',
        'directory': 'Natural',
    }];


map.addControl(new LayerTree({
    layers: layers,
    onClickLoad: true
}), 'bottom-left');