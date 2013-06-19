var map;
var layerExtent = new OpenLayers.Bounds( -14050000, 3800000, -13000000 , 6300000);
var map_extent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);

//Map base options
var map_options = {
    controls: [],
    projection: new OpenLayers.Projection("EPSG:900913"),
    displayProjection: new OpenLayers.Projection("EPSG:4326"),
    units: "m",
    numZoomLevels: 13,
    maxResolution: 156543.0339,
    eventListeners: {
        "zoomend": this.zoomHandler,
        scope: this
    }
};    

function init() {
    map = new OpenLayers.Map("map", {
      restrictedExtent: layerExtent,
      displayProjection: new OpenLayers.Projection("EPSG:4326"),
      projection: "EPSG:3857"
    });


    
    var hybrid = new OpenLayers.Layer.Bing({
        name: "Hybrid",
        key: apiKey,
        type: "AerialWithLabels"
    });

    map.addLayer(hybrid);

    map.setCenter(new OpenLayers.LonLat(-120, 45), 4);
}