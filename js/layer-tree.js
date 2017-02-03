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
        var layerBox = document.createElement('button');
        layerBox.className = 'mapboxgl-ctrl-icon';

        //legend ui
        var legendDiv = document.createElement('div');
        legendDiv.id = 'mapboxgl-legend';

        layerBox.appendChild(legendDiv);
        this._container.appendChild(layerBox);

        //clone array of layers
        var layersArrayClone = this.options.layers.slice(0);

        getLayers(this._map, layersArrayClone, this.collection);

        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

}

function getLayers(map, layers, collection) {
    map.on("render", function() {
      if(map.loaded()) {
        for (var i = 0; i < layers.length; i++) {
            var lyr = map.getSource(layers[i]);
            if (lyr) {
              layers.splice([i]);
              collection.push(lyr);
              console.log(collection);
          }
        }
      }
    });
}

