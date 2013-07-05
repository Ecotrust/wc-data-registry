var map; 
var marker = new L.Marker([0, 0]);
var clearControl;

//Much of this code was taken from https://gist.github.com/ns-1m/2935530
var clearBtn = L.Control.extend({
    options: {
        position: 'topright'
    },

    initialize: function (options) {
        this._button = {};
        this.setButton({
            text: 'clear',
            iconUrl: 'static/img/cross.png',
            onClick: clearMarkers
        });
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'clear-marker-button');
        this._container = container;
        this._update();
        return this._container;
    },

    onRemove: function (map) {
    },

    setButton: function(options) {
        var button = {
            'text': options.text,
            'iconUrl': options.iconUrl,
            'onClick': options.onClick
        };
        this._button = button;
        this._update();
    },

    _update: function () {
        if (!this._map) {
            return;
        }
         
        this._container.innerHTML = '';
        this._makeButton(this._button);
    },
         
    _makeButton: function (button) {
        var newButton = L.DomUtil.create('button', 'leaflet-buttons-control-button', this._container);
        var image = L.DomUtil.create('img', 'leaflet-buttons-control-img', newButton);
        image.setAttribute('src',button.iconUrl);
        if(button.text !== ''){
         
            L.DomUtil.create('br','',newButton); //there must be a better way
             
            var span = L.DomUtil.create('span', 'leaflet-buttons-control-text', newButton);
            var text = document.createTextNode(button.text); //is there an L.DomUtil for this?
            span.appendChild(text);
        }
        L.DomEvent
            .addListener(newButton, 'click', L.DomEvent.stop)
            .addListener(newButton, 'click', button.onClick,this);
        L.DomEvent.disableClickPropagation(newButton);
        return newButton;
    }
});

function init() {
    map = L.map('map').setView([39, -127], 3);

    L.tileLayer('http://{s}.tile.cloudmade.com/efb495f98c9b4dac95d13787e0a72603/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    map.on('click', onMapClick);
    clearControl = new clearBtn();
    map.addControl(clearControl);
    clearControl._container.hidden = true;
}

function onMapClick(e) {
    if (map.hasLayer(marker)) {
        map.removeLayer(marker);
    }
    marker.setLatLng(e.latlng);
    app.viewModel.bbLat(e.latlng.lat);      //Cannot go above 90 anyway.
    if (e.latlng.lng >= 0) {
        var offset = Math.floor((e.latlng.lng + 180)/360);
    } else {
        var offset = Math.ceil((e.latlng.lng - 180)/360);
    }
    app.viewModel.bbLon(e.latlng.lng - (offset * 360));
    // alert(e.latlng.lat + ', ' + e.latlng.lng + '\n' + app.viewModel.bbLat() + ', ' + app.viewModel.bbLon());
    app.viewModel.useBb(true);
    map.addLayer(marker);
    clearControl._container.hidden = false;
    app.runQuery(app.defaultQueryCallback);
}

function clearMarkers() {
    if (map.hasLayer(marker)){
        map.removeLayer(marker);
    }
    app.viewModel.useBb(false);
    clearControl._container.hidden = true;
}