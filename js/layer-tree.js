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

    map.collection = collection;
    map.lyrs = layers;

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
            //_this.loadBasemaps(map, _this.options.basemaps);
            _this.enableSortHandler(map, _this.loadComplete(_this, map, collection));
        }
    });
}

//callback to append layer to legend
LayerTree.prototype.appendLayerToLegend = function(map, mapLyrObj, lyr) {
    var legendId = '#mapboxgl-legend';

    var directoryName = lyr.directory;
    var directoryId = directoryName.replace(/\s+/g, '-').toLowerCase();

    var layerName = lyr.name;
    var layerId = lyr.source;
    var layerDiv = "<div id='" + layerId + "' class='layer-item grb'><input class='toggle-layer' type='checkbox'><span class='name'>" + layerName + "</span></div>";

    if ($('#' + directoryId).length) {
        $('#' + directoryId).append(layerDiv);
    } else {
        $(legendId).append("<div id='" + directoryId + "' class='layer-directory grb'><div class='directory-name'>" + directoryName + "<i class='fa toggle-directory-open' aria-hidden='true'</i></div></div>");
        $('#' + directoryId).append(layerDiv);
    }
}

LayerTree.prototype.loadBasemaps = function(map, basemaps) {
    var legendId = '#mapboxgl-legend';

    for (var i = basemaps.length - 1; i >= 0; i--) {
        var baseDir = basemaps[i].directory;
        var baseDirID = baseDir.replace(/\s+/g, '-').toLowerCase();

        var mapStyle = basemaps[i].name;
        var mapStyleID = basemaps[i].id;
        var mapStyleSource = basemaps[i].source;

        var baseDiv = "<div id='" + mapStyleID + "' class='layer-item grb'><input class='toggle-basemap' type='radio' base-style='" + mapStyleSource + "'><span class='name'>" + mapStyle + "</span></div>";

        if ($('#' + baseDirID).length) {
            $('#' + baseDirID).append(baseDiv);
        } else {
            $(legendId).append("<div id='" + baseDirID + "' class='layer-directory grb'><div class='directory-name'>" + baseDir + "</div></div>");
            $('#' + baseDirID).append(baseDiv);
        }

        //rough logic to get map style param
        var styleSubstring = basemaps[i].source.replace('mapbox://styles','');
        if (map.style.stylesheet.sprite.indexOf(styleSubstring) > -1) {
            $('#'+ mapStyleID +' input').prop("checked", true);
        }

        $('body').on('click', '.toggle-basemap', function() {
            var elmId = $(this).parent().attr('id');
            var clickedMap = $('#'+elmId + ' input[type=radio]');
            $('.toggle-basemap').prop('checked', false);

            clickedMap.prop('checked', true)
            //map.setStyle(clickedMap.attr('base-style'), {diff:true});
        });
    };

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

    $('body').on('click', '.toggle-layer', function() {
        var lyrId = $(this).parent().attr('id');

        if ($(this).is(':checked')) {
            map.setLayoutProperty(lyrId, 'visibility', 'visible');
            var features = map.queryRenderedFeatures({layers:[lyrId]});
            if (features === undefined || features.length === 0) {
                $('#'+lyrId).addClass('ghost')
            } else {
                $('#'+lyrId).removeClass('ghost');
            }
        } else {
            map.setLayoutProperty(lyrId, 'visibility', 'none');
        }
    });

    $('.directory-name').click(function() {
        $(this).parent().find('.layer-item').toggle();
        $(this).find('i').toggleClass('toggle-directory-open toggle-directory-close');
    });

    sortLoadedDirectories();


    //sort legends based on initial on layer index
    function sortLoadedLayers(lyrArray, dir) {
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
        if (visibility !== 'none') {
            $(lyrElm + ' input').prop("checked", true);
        }
    }

    //assign legend icons
    function addIcons(map, id, lyrs, lyrElm) {
        var collectionObj = $.grep(lyrs, function(i) {
            return id === i.source;
        });

        if (collectionObj.length) {
            var mapLayer = map.getLayer(id);
            var mapSource = map.getSource(id);

            //is there a default icon in the config?
            if (!collectionObj[0].hasOwnProperty('icon')) {
                if (mapLayer.type === 'fill' && mapSource.type === 'geojson') {
                    var fillColor = map.getPaintProperty(id, 'fill-color') || '';
                    var fillOpacity = map.getPaintProperty(id, 'fill-opacity') || '';
                    var faClass = "<i class='fa geojson-polygon' aria-hidden='true' style='color:"+ fillColor +";opacity:"+ fillOpacity+";'></i>";

                } else if (mapLayer.type === 'line' && mapSource.type === 'geojson') {
                    var lineColor = map.getPaintProperty(id, 'line-color') || '';

                    if (map.getPaintProperty(id, 'line-dasharray')) {
                        var faClass = "<i class='fa geojson-line-dashed' aria-hidden='true' style='color:"+ lineColor +";'></i>";
                    } else {
                        var faClass = "<i class='fa geojson-line-solid' aria-hidden='true' style='color:"+ lineColor +";'></i>";
                    }
                }
                $(lyrElm + ' span.name').before(faClass);
            } else {
                var imgClass = "<img src='" + collectionObj[0].icon + "' alt='" + collectionObj[0].id + "'>";
                $(lyrElm + ' span.name').before(imgClass);
            }
        }
    }

    //sort initial loading of directories
    function sortLoadedDirectories() {
        var layerDirectories = $('.layer-directory');
        var legend = $('#mapboxgl-legend');
        $.each(layerDirectories, function(i) {
            //get the highest index value for each directory
            var highestIndex = $(this).children('.layer-item:first');
            var indexVal = highestIndex.attr('initial-index') * 10;

            //apply value to directory
            $(this).attr('initial-index', indexVal);
        })

        sortLoadedLayers(layerDirectories, legend);
    }

}

//callback to activate jquery-ui-sortable
LayerTree.prototype.enableSortHandler = function(map) {
    //sortable directories
    $('#mapboxgl-legend').sortable({
        items: '.layer-directory',
        stop: function(e, ui) {

            var orderArray = [];
            var layers = map.getStyle().layers;
            var newDirOrder = ui.item.parent().sortable('toArray');

            //this loop starts at the directory above the lowest indexed
            for (var i = newDirOrder.length - 2; i >= 0; i--) {
                var dir = newDirOrder[i];
                var layerArray = $('#' + dir).sortable('toArray');

                for (var j = layerArray.length - 1; j >= 0; j--) {
                    map.moveLayer(layerArray[j]);
                };
            }
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

    var moveEnd = function(e) {
        var lyrsArray = [];
        for (var i = map.lyrs.length - 1; i >= 0; i--) {
            var lyrID = map.lyrs[i].source;

            if ($('#'+ lyrID + ' .toggle-layer').prop('checked')) {
                var features = map.queryRenderedFeatures({layers:[lyrID]});
                if (features === undefined || features.length === 0) {
                    $('#'+lyrID).addClass('ghost')
                } else {
                    $('#'+lyrID).removeClass('ghost');
                }
            }
        };
    }


    map.on('render', mapLoaded);
    map.on('moveend', moveEnd);
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
