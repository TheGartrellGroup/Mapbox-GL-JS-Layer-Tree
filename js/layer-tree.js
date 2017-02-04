'use strict';

//@implements {IControl}
class LayerTree {

    //@param {Object} [options]
    constructor(options) {
        this.options = options;
        this.collection = [];
    }

    onAdd(map) {
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

        this.getLayers(this._map, this.options.layers, this.collection, this.appendLayerToLegend, this.enableSortHandler, this.loadComplete);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}

//get layers once they start loading
LayerTree.prototype.getLayers = function(map, layers, collection, appendLegend, sortHandler, loadComplete) {
    map.on('sourcedataloading', function(e) {
        var lyr = layers.filter(function( layer ) {
          return layer.source === e.sourceId;
        });

        if (lyr[0]) {
            var mapLyrObj = map.getSource(e.sourceId);
            collection.push(mapLyrObj);
            appendLegend(map, mapLyrObj, lyr[0]);
        }

        if (collection.length === layers.length) {
            sortHandler(map, loadComplete(map, collection));
        }
    });
}

//callback to append layer to legend
LayerTree.prototype.appendLayerToLegend = function(map, mapLyrObj, lyr) {
    var legendId = '#mapboxgl-legend';

    var directoryName = lyr.directory;
    var directoryId = directoryName.replace(/\s+/g, '-').toLowerCase()

    var layerName = lyr.source;
    var layerId = layerName.replace(/\s+/g, '-').toLowerCase();
    var layerType = lyr.select.toLowerCase();
    var layerDiv = "<div id='" + layerId + "' class='layer-item grb'><input class='toggle-layer' type='" + layerType + "' >"+ layerName + "</div>";

    if ($('#'+directoryId).length) {
        $('#'+directoryId).append(layerDiv);
    } else {
        $(legendId).append("<div id='"+ directoryId + "' class='layer-directory grb'><div class='directory-name'>" + directoryName + "</div></div>")
        $('#'+directoryId).append(layerDiv);
    }
}

//callback to activate jquery-ui-sortable
LayerTree.prototype.enableSortHandler = function(map) {
    $('#mapboxgl-legend').sortable({
        items: '.layer-directory'
    });
}


//callback to check if map is loaded
LayerTree.prototype.loadComplete = function(map, collection) {
    map.on('render', mapLoaded);

    function mapLoaded() {
        if (map.loaded()) {
            //if layer is initially visible, activate checkbox
            for (var i = collection.length - 1; i >= 0; i--) {
                var visibility = map.getLayoutProperty(collection[i].id, 'visibility');
                if (visibility === 'visible') {
                    var lyrId = "#" + collection[i].id.replace(/\s+/g, '-').toLowerCase();
                    $(lyrId + ' input').prop("checked", true );
                }
            }
            map.off('render', mapLoaded)
        }
    }
}


$(document).ready(function() {
    $('body').on('click', '.toggle-layer', function() {
        var elmId = $(this).parent().attr('id');
        var lyrId = elmId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if ($(this).is(':checked')) {
            map.setLayoutProperty(lyrId, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(lyrId, 'visibility', 'none');
        }
    })
});


