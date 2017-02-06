'use strict';
//@implements {IControl}
function LayerTree(options) {
    this.options = options;
    this.collection = [];
}


LayerTree.prototype.onAdd = function(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    //layer manager bounding box
    var layerBox = document.createElement('div');
    layerBox.className = 'mapboxgl-ctrl legend-container';

    //legend ui
    var legendDiv = document.createElement('div');
    legendDiv.id = 'mapboxgl-legend';

    layerBox.appendChild(legendDiv);
    this._container.appendChild(layerBox);

    this.getLayers(map);
    return this._container;
}

LayerTree.prototype.onRemove = function() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
}


//get layers once they start loading
LayerTree.prototype.getLayers = function(map) {
    var _this = this;
    var layers = _this.options.layers;
    var collection = _this.collection;

    map.on('sourcedataloading', function(e) {
        var lyr = layers.filter(function(layer) {
            return layer.source === e.sourceId;
        });

        if (lyr[0]) {
            var mapLyrObj = map.getSource(e.sourceId);
            collection.push(mapLyrObj);
            _this.appendLayerToLegend(map, mapLyrObj, lyr[0]);
        }

        if (collection.length === layers.length) {
            _this.enableSortHandler(map, _this.loadComplete(_this, map, collection));
        }
    });
}

//callback to append layer to legend
LayerTree.prototype.appendLayerToLegend = function(map, mapLyrObj, lyr) {
    var legendId = '#mapboxgl-legend';

    var directoryName = lyr.directory;
    var directoryId = directoryName.replace(/\s+/g, '-').toLowerCase()

    var layerName = lyr.name;
    var layerId = lyr.source;
    var layerDiv = "<div id='" + layerId + "' class='layer-item grb'><input class='toggle-layer' type='checkbox'><span class='name'>" + layerName + "</span></div>";

    if ($('#' + directoryId).length) {
        $('#' + directoryId).append(layerDiv);
    } else {
        $(legendId).append("<div id='" + directoryId + "' class='layer-directory grb'><div class='directory-name'>" + directoryName + "</div></div>")
        $('#' + directoryId).append(layerDiv);
    }
}

LayerTree.prototype.updateLegend = function(map, collection, lyrs) {
    var layers = map.getStyle().layers;
    var arrayObj = [];

    //update legend once layers are fully loaded
    for (var i = collection.length - 1; i >= 0; i--) {
        var id = collection[i].id;
        var lyrElm = '#' + id;
        var dir = $(lyrElm).parent('.layer-directory');
        var lyrArray = dir.children('.layer-item');

        var layerIndex = findLayerIndex(layers, collection, i);
        $(lyrElm).attr('initial-index', layerIndex);

        sortLoadedLayers(lyrArray, dir);
        visible(map, id, lyrElm);
        addIcons(map, id, lyrs, lyrElm);
    }

    //sort legends based on initial on layer index
    function sortLoadedLayers() {
        lyrArray.sort(function(a, b) {
            var aVal = parseInt(a.getAttribute('initial-index')),
                bVal = parseInt(b.getAttribute('initial-index'));
            return bVal - aVal;
        });

        lyrArray.detach().appendTo(dir);
    }

    //activate checkbox if layer is visible
    function visible(map) {
        var visibility = map.getLayoutProperty(id, 'visibility');
        if (visibility === 'visible') {
            $(lyrElm + ' input').prop("checked", true);
        }
    }

    //assign legend icons
    function addIcons(map, id, lyrs, lyrElm) {
        var collectionObj = $.grep(lyrs, function(i) {
            return id === i.source;
        });

        if (collectionObj.length && !collectionObj[0].hasOwnProperty('icon')) {
            var mapLayer = map.getLayer(id);
            var mapSource = map.getSource(id);
            if (mapLayer.type === 'fill' && mapSource.type === 'geojson') {
                var fillColor = map.getPaintProperty(id, 'fill-color') || '';
                var fillOpacity = map.getPaintProperty(id, 'fill-opacity') || '';
                var faClass = "<i class='fa geojson-polygon' aria-hidden='true' style='color:"+ fillColor +";opacity:"+ fillOpacity+";'></i>";

                $(lyrElm + ' span.name').before(faClass);
            }
        }
    }

}

//callback to activate jquery-ui-sortable
LayerTree.prototype.enableSortHandler = function(map) {
    //sortable directories
    $('#mapboxgl-legend').sortable({
        items: '.layer-directory',
        change: function(e, ui) {
            console.log(e, ui);
        }
    });

    //sortable layers in a directory
    $('.layer-directory').sortable({
        items: '.layer-item',
        stop: function(e, ui) {
            /**
            IMPORTANT: mapbox-gl ordering is dictated by
            bottom-most layers appearing the highest on map!

            Ex. layers = [ 'foo', 'bar']
            'bar' is going to show on top of 'foo'
            **/

            var orderArray = [];
            var newLayerOrder = ui.item.parent().sortable('toArray').reverse();
            var layers = map.getStyle().layers;

            for (var i = newLayerOrder.length - 1; i >= 0; i--) {
                var layerIndex = findLayerIndex(layers, newLayerOrder, i);

                if (layerIndex) {
                    var obj = {
                        'originalOrder': layerIndex,
                        'newOrder': i,
                        'source': newLayerOrder[i],

                    }
                    orderArray.push(obj);
                }

            };

            //move layer order
            orderArray.sort(function(a, b) {
                if (b.newOrder > a.originalOrder) {
                    map.moveLayer(a.source, b.source);
                } else {
                    map.moveLayer(b.source, a.source);
                }
            })
        }
    });
}

//callback to check if map is loaded
LayerTree.prototype.loadComplete = function(_that, map, collection) {
    var mapLoaded = function(updateLegend) {
        if (map.loaded()) {

            _that.updateLegend(map, collection, _that.options.layers)

            $('.mapboxgl-ctrl.legend-container').show();
            map.off('render', mapLoaded)
        }
    }

    map.on('render', mapLoaded);
}

//find layer index location
function findLayerIndex(layers, array, indexVal) {
    var index = -1;
    for (var i = layers.length - 1; i >= 0; i--) {
        if (typeof array[indexVal] === 'object' && array[indexVal] !== null) {
            if (layers[i].id === array[indexVal].id) {
                index = i;
                break
            }
        } else {
            if (layers[i].id === array[indexVal]) {
                index = i;
                break
            }
        }

    };
    return index;
}

$(document).ready(function() {
    $('body').on('click', '.toggle-layer', function() {
        var elmId = $(this).parent().attr('id');
        var lyrId = elmId;

        if ($(this).is(':checked')) {
            map.setLayoutProperty(lyrId, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(lyrId, 'visibility', 'none');
        }
    })
});
