var map; 
var marker = new L.Marker([0, 0]);
function init() {
    map = L.map('map').setView([39, -120], 3);
    //var marker = L.marker([0,0]);

    L.tileLayer('http://{s}.tile.cloudmade.com/efb495f98c9b4dac95d13787e0a72603/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    map.on('click', onMapClick);
}

function onMapClick(e) {
    if (map.hasLayer(marker)) {
        map.removeLayer(marker);
    }
    marker.setLatLng(e.latlng);
    app.viewModel.bbLat(e.latlng.lat);
    app.viewModel.bbLon(e.latlng.lng);
    app.viewModel.useBb(true);
    map.addLayer(marker);
}
