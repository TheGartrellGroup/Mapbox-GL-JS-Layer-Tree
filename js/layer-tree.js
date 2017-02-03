'use strict';

class LayerTree {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

        var layerBox = document.createElement('button');
        layerBox.className = 'mapboxgl-ctrl-icon';

        this._container.appendChild(layerBox);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
