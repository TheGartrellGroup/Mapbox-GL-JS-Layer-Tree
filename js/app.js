mapboxgl.accessToken = '';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-75, 15],
    zoom: 2
});


map.on('load', function() {

    map.addSource('geo-regions', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_geography_regions_polys.geojson' });
    map.addLayer({
        "id": "geo-regions",
        "type": "fill",
        "source": "geo-regions",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#4842f4',
            'fill-opacity': 0.3
        }
    });

    map.addSource('land', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson' });
    map.addLayer({
        "id": "land",
        "type": "fill",
        "source": "land",
        "layout": {
            "visibility": 'visible'
        },
        "paint": {
            'fill-color': '#e0d4b8',
            'fill-opacity': 0.8
        }
    });

    map.addSource('glacial', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_glaciated_areas.geojson' });
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

    map.addSource('reefs', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_reefs.geojson' });
    map.addLayer({
        "id": "reefs",
        "type": "line",
        "source": "reefs",
        "paint": {
            "line-color": "#f45353",
            "line-width": 2
        }
    });

    map.addSource('rivers', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_rivers_lake_centerlines_scale_rank.geojson' });
    map.addLayer({
        "id": "rivers",
        "type": "line",
        "source": "rivers",
        "layout": {
            'visibility': 'visible'
        },
        "paint": {
            "line-color": "#4177f4",
            "line-width": 2,
            "line-dasharray": [4, 4],
        }
    });

    map.addSource('boundary', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_boundary_lines_land.geojson' });
    map.addLayer({
        "id": "boundary-line",
        "type": "line",
        "source": "boundary",
        "paint": {
            "line-color": "#e07a14",
            "line-width": 3,
            "line-dasharray": [2, 2],
        }
    });


    map.addSource('ports', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson' });
    map.addLayer({
        "id": "port",
        "type": "circle",
        "source": "ports",
        "paint": {
            'circle-color': '#35a045',
            'circle-opacity': 0.8,
            'circle-stroke-color': '#000',
            'circle-stroke-width': 1
        }
    });

    map.setFilter('port', ['<', 'natlscale', 6]);

    map.addSource('airports', { type: 'geojson', data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson' });
    map.addLayer({
        "id": "airport",
        "type": "symbol",
        "source": "airports",
        "layout": {
            "icon-image": "airport-11"
        },
        "paint": {
            "icon-color": '#0dd224',
            "icon-halo-color": "#0dd224"
        }
    });
})


var layers =

    [{
        'name': 'Geographic Regions',
        'id': 'geo-regions',
        'source': 'geo-regions',
        'directory': 'Misc',
    }, {
        'name': 'Land',
        'id': 'land',
        'source': 'land',
        'directory': 'Natural',
    }, {
        'name': 'Glaciers',
        'id': 'glaciers',
        'source': 'glacial',
        'directory': 'Natural',
    }, {
        'name': 'Reef Boundaries',
        'id': 'reefs',
        'source': 'reefs',
        'directory': 'Natural',
    }, {
        'name': 'Rivers',
        'id': 'rivers',
        'source': 'rivers',
        'directory': 'Natural',
    }, {
        'name': 'Boundary Lines',
        'id': 'boundary-line',
        'source': 'boundary',
        'directory': 'Travel',
    }, {
        'name': 'Points',
        'id': 'travel-group',
        'layerGroup': [{
            'id': 'port',
            'source': 'ports',
            'name': 'Major Shipping Ports'
        }, {
            'id': 'airport',
            'source': 'airports',
            'name': 'Airports',
            'icon': '../icons/airplane.svg'
        }, ],
        'directory': 'Travel'
    }];

var directoryOptions = [{ 'name': 'Travel', 'open': false }]

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new LayerTree({
    layers: layers,
    directoryOptions: directoryOptions
}), 'bottom-left');