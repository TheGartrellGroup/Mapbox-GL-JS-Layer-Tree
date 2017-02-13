'use strict';
//@implements {IControl}
function LayerTree(options) {
    this.options = options;
    this.sources = [];
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
    var sourceCollection = _this.sources;
    var numSources = [];

    map.sourceCollection = sourceCollection;
    map.lyrs = layers;

    for (var s = layers.length - 1; s >= 0; s--) {
        if ($.inArray(layers[s].source, numSources) === -1) {
            numSources.push(layers[s].source)
        }
    };

    map.on('sourcedataloading', function(e) {
        var lyr = layers.filter(function(layer) {
            return layer.source === e.sourceId;
        });

        if (lyr.length) {
            for (var l = lyr.length - 1; l >= 0; l--) {
                if (lyr[l] === lyr[lyr.length-1]) {
                    var mapLyrObj = map.getSource(e.sourceId);
                    sourceCollection.push(mapLyrObj);
                }
                _this.appendLayerToLegend(map, mapLyrObj, lyr[l]);
            };
        }

        if (sourceCollection.length === numSources.length) {
            //_this.loadBasemaps(map, _this.options.basemaps);
            _this.enableSortHandler(map, _this.loadComplete(_this, map, sourceCollection));
        }
    });
}

//callback to append layer to legend
LayerTree.prototype.appendLayerToLegend = function(map, mapLyrObj, lyr) {
    var legendId = '#mapboxgl-legend';

    var directoryName = lyr.directory;
    var directoryId = directoryName.replace(/\s+/g, '-').toLowerCase();

    var layerName = lyr.name;
    var layerId = lyr.id;
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

            clickedMap.prop('checked', true);

            var mapSources = Object.entries(map.getStyle().sources);
            var mapLayers = map.getStyle().layers;

            map.on('style.load', function() {
                var keepLayers = [];
                for (var i = mapLayers.length - 1; i >= 0; i--) {
                    for (var j = mapSources.length - 1; j >= 0; j--) {
                        if (mapSources[j][0] !== 'composite') {
                            if (!map.getSource(mapSources[j][0])) {
                                map.addSource(mapSources[j][0], mapSources[j][1].url);
                            }
                            map.addLayer()
                        }
                        if (mapSources[j] !== 'composite' && mapSources[j] === mapLayers[i].source) {
                            keepLayers.push(mapLayers[i]);
                        }
                    };
                };
            });

        });
    };

}

LayerTree.prototype.updateLegend = function(map, sourceCollection, lyrs) {
    var layers = map.getStyle().layers;
    var arrayObj = [];

    //update legend once layers are fully loaded
    for (var i = lyrs.length - 1; i >= 0; i--) {
        var id = lyrs[i].id;
        var lyrElm = '#' + id;
        var dir = $(lyrElm).parent('.layer-directory');
        var lyrArray = dir.children('.layer-item');

        var layerIndex = findLayerIndex(layers, lyrs, i);
        $(lyrElm).attr('initial-index', layerIndex);

        sortLoadedLayers(lyrArray, dir);
        visible(map, id, lyrElm);
        addIcons(map, id, lyrs, lyrElm);
    }

    $('body').on('click', '.toggle-layer', function() {
        var lyrId = $(this).parent().attr('id');

        if ($(this).is(':checked')) {
            map.setLayoutProperty(lyrId, 'visibility', 'visible');

            map.on('render', function() {
                if (map.loaded() && map.getLayoutProperty(lyrId, 'visibility') === 'visbile') {
                    var features = map.queryRenderedFeatures({layers:[lyrId]});
                    if (features === undefined || features.length === 0) {
                        $('#'+lyrId).addClass('ghost')
                    } else {
                        $('#'+lyrId).removeClass('ghost');
                    }
                }
            })
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
    function visible(map, id, lyrElm) {
        var visibility = map.getLayoutProperty(id, 'visibility');
        if (visibility !== 'none') {
            $(lyrElm + ' input').prop("checked", true);
        }
    }

    //assign legend icons
    function addIcons(map, id, lyrs, lyrElm) {
        var obj = $.grep(lyrs, function(i) {
            return id === i.id;
        });

        if (obj.length) {
            var mapLayer = map.getLayer(id);
            var mapSource = map.getSource(obj[0].source);

            //is there a default icon in the config?
            if (!obj[0].hasOwnProperty('icon')) {
                if (mapLayer.type === 'fill' && mapSource.type === 'geojson') {
                    var fillColor = map.getPaintProperty(id, 'fill-color') || '';
                    var fillOpacity = map.getPaintProperty(id, 'fill-opacity') || '';
                    var polyOutline = map.getPaintProperty(id, 'fill-outline-color') || '';
                    var faClass = "<i class='fa geojson-polygon' aria-hidden='true' style='color:"+ fillColor +";opacity:"+ fillOpacity+";-webkit-text-stroke: 1px "+ polyOutline+";'></i>";

                } else if (mapLayer.type === 'line' && mapSource.type === 'geojson') {
                    var lineColor = map.getPaintProperty(id, 'line-color') || '';

                    if (map.getPaintProperty(id, 'line-dasharray')) {
                        var faClass = "<i class='fa geojson-line-dashed' aria-hidden='true' style='color:"+ lineColor +";'></i>";
                    } else {
                        var faClass = "<i class='fa geojson-line-solid' aria-hidden='true' style='color:"+ lineColor +";'></i>";
                    }
                } else if (mapLayer.type === 'circle' && mapSource.type === 'geojson') {
                    var fillColor = map.getPaintProperty(id, 'circle-color') || '';
                    var circleOutline = map.getPaintProperty(id, 'circle-stroke-color') || '';
                    var faClass = "<i class='fa geojson-circle' aria-hidden='true' style='color:"+ fillColor +";-webkit-text-stroke: 1px "+ circleOutline+";'></i>";
                }
                $(lyrElm + ' span.name').before(faClass);
            } else {
                var imgClass = "<img src='" + obj[0].icon + "' alt='" + obj[0].id + "'>";
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
                        'id': newLayerOrder[i],

                    }
                    orderArray.push(obj);
                }

            };

            //move layer order
            orderArray.sort(function(a, b) {
                if (b.newOrder > a.originalOrder) {
                    map.moveLayer(a.id, b.id);
                } else {
                    map.moveLayer(b.id, a.id);
                }
            })
        }
    });
}

//callback to check if map is loaded
LayerTree.prototype.loadComplete = function(_that, map, sourceCollection) {
    var mapLoaded = function(updateLegend) {
        if (map.loaded()) {

            _that.updateLegend(map, sourceCollection, _that.options.layers);

            $('.mapboxgl-ctrl.legend-container').show();
            map.off('render', mapLoaded)
        }
    }

    var moveEnd = function(e) {
        var lyrsArray = [];
        for (var i = map.lyrs.length - 1; i >= 0; i--) {
            var lyrID = map.lyrs[i].id;

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
function findLayerIndex(allLayers, ourLayers, indexVal) {
    var index = -1;
    for (var i = allLayers.length - 1; i >= 0; i--) {
        if (typeof ourLayers[indexVal] == 'object' && ourLayers[indexVal] !== null) {
            if (allLayers[i].id === ourLayers[indexVal].id) {
                index = i;
                break
            }
        } else {
            if (allLayers[i].id === ourLayers[indexVal]) {
                index = i;
                break
            }
        }

    };
    return index;
}
