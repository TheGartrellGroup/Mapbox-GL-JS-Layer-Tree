# Mapbox GL JS Layer Tree for the PORT
#### Allow users to interactively organize and reposition different map layers.

#### [Demo](http://dev.gartrellgroup.com/layer-tree/)

### Install:
- `yarn` to install current set of dependencies
  - Additional dependencies can be installed via `yarn add [packagename]`
- `gulp` to develop locally (includes a local server and watchers on index.html, js, and css files)
- `gulp build` will compile/minify required javascript and default layer-tree.css.


### Dependencies:
- jQuery, jQuery UI Sortable Module, and Font-Awesome are all currently required.
  - jQuery and jQuery UI-Sortable are both included within the compiled `dist/js/scripts.min.js`
  - Font-Awesome CSS should be added in your HTML `<head>`

### Regular Usage:
- #### Layer Config:
    - **name** - to be displayed as the layer name in Legend
    - **id** - layer id
    - **source** - layer source
    - **directory** - directory where the layer is apart of
    - **icon** (optional) - path to img src and is solely reflected in the Layer Tree legend.  It does not modify the symbology of a layer. Additionally, in a group layer object configuration - the icon param can inherit a child layer's default icon style - via the child layer's ID.
    - **path** (optional) - references source path for geojson and is *only* used in conjunction with onClickLoad param (see further below)
    - **hideLabel** (optional - group layer only) - in a group layer object configuration, this can be used to hide specific child layers from the Layer Tree by using an array of child layer IDs.

     ```javascript
    var lyrArray =
         [
             {
                 'name': 'Geographic Regions',
                 'id': 'geo-regions',
                 'source': 'geo-regions',
                 'directory': 'Misc',
             },
             {
                 'name': 'Land',
                 'id': 'land',
                 'source': 'land',
                 'directory': 'Natural',
             },
             {
                 'name': 'Glaciers',
                 'id': 'glaciers',
                 'source': 'glacial',
                 'directory': 'Natural',
                 'icon': 'http://external.image.png'
             },
             {
                 'name': 'Boundary Lines',
                 'id': 'boundary-line',
                 'source': 'boundary',
                 'directory': 'Travel',
             },
             {
                 'name': 'Points',
                 'id': 'travel-group',
                 'icon': 'port',
                 'hideLabel': ['port', 'airport'],
                 'layerGroup' : [
                     {
                         'id': 'port',
                         'source': 'ports',
                         'name': 'Major Shipping Ports'
                     },
                     {
                         'id': 'airport',
                         'source': 'airports',
                         'name': 'Airports'
                     },
                 ],
                 'directory': 'Travel'
             }
        ];
     ```
     ##### onClickLoad (optional)
     Since the Layer Tree is populated within `map.on('load', function()`, *mapLayers* and *mapSources* are added inside the event listener. Often times, may want to load layers only on 'click'. To account for this (*geojson only*), users will need to initially setup their layers sources with empty featureCollections. The `onClickLoad` param also needs to be added to LayerTree control and must be set to `true`. If a geojson layer has a layout visibility not set to 'none' - the Layer Tree will behave as it normally would - where the layer will be activated and shown on map load. 
     
     Example js setup [here](https://github.com/TheGartrellGroup/Mapbox-GL-JS-Layer-Tree/blob/master/js/onClickLoad-example.js)

    ```javascript
    // **** EMPTY GEOJSON PLACEHOLDER ****
    var emptyGJ = {
        'type': 'FeatureCollection',
        'features': []
    };

    map.on('load', function () {
        // *** emptyGJ is now the initial data source ***
        map.addSource('land', { type: 'geojson', data: emptyGJ });
        map.addLayer({
            "id": "land",
            "type": "fill",
            "source": "land",
            "paint": {
                'fill-color': '#a89b97',
                'fill-opacity': 0.8
            }
        });

    var layers =
    [
        {
            'name': 'Land',
            'id': 'land',
            'source': 'land',
            // **** SOURCE PATH IS NOW HERE ****
            'path': 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
            'directory': 'Directory 1',
        }
     ];
     ```
- #### Layer Directory - Open/Closed (Optional)
    - A directory can be set to open or close on load (they'll default to open if no overriding configuration is passed)
     ```javascript
    var directoryOptions =
    [
        {
            'name': 'Natural',
            'open': false
        }
    ]
    ```

- #### Instantiate Layer Tree
     ```javascript
       map.addControl(new LayerTree({
            layers: lyrArray,
            directoryOptions: directoryOptions,
       }, 'bottom-left')
    ```

### Notes:
 - Layers within the same directory **must** be configured together
    - For example: *Layer A* and *Layer C* can not be of the same directory - if *Layer B* is also **not** within the same directory and has been added as a mapLayer prior to *Layer C* being added.
-  If the layer is a geojson and no icon is passed to the layer config, the Layer Tree will automatically add a FontAwesome icon to the legend
 - Icon params within the layer config **only** update the legend - not layer symbology on the map
 - `onClickLoad` only works with geojson layers and should have layout visibilities set to 'none'
