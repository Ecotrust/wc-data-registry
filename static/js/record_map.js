var map; 
var marker = new L.Marker([0, 0]);
var clearControl;

function init() {
    map = L.map('map').setView([39, -127], 3);      //TODO: zoom to bounding box
    L.tileLayer('http://{s}.tile.cloudmade.com/efb495f98c9b4dac95d13787e0a72603/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);
}

function showBbox() {
    var p1 = new L.LatLng(app.viewModel.record_bbox()[3], app.viewModel.record_bbox()[0]);
    var p2 = new L.LatLng(app.viewModel.record_bbox()[1], app.viewModel.record_bbox()[2]);
    var bbox = new L.Rectangle([p1, p2]);
    map.addLayer(bbox);
    var bounds = bbox.getBounds();
    map.fitBounds(bounds);
}
