mapboxgl.accessToken = 'pk.eyJ1IjoiZG5zZW1pbmFyYSIsImEiOiJpcVhHYXQ4In0.11lnsgwtP94BZEDcZHZK2g';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.595, 45.589],
    zoom: 12
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
