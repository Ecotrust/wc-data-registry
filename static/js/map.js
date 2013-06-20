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

    var pointLayer = new OpenLayers.Layer.Vector("Point Layer");

    var point = new OpenLayers.Control.DrawFeature(
        pointLayer,
        OpenLayers.Handler.Point,
        {
            "featureAdded": pointDrawn
        }
    );

    function pointDrawn(point) {
        var lonlat = point.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        clearOldPoints(point);
        app.viewModel.updateCoordVals(lonlat.x, lonlat.y);
        // re-project point to 900913
        point.geometry.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
    }

    // Only display the newest selected point
    function clearOldPoints(point){
        for (var i = 0; i <= pointLayer.features.length; i++){
            if (pointLayer.features[i] != point){
                pointLayer.removeFeatures(pointLayer.features[i]);
            }
        }
    }

    function pointSelected(lat, lon){
        var zoom = map.zoom < 12 ? map.zoom + 2: 12;
        point = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(parseFloat(lon), parseFloat(lat)));
        point.geometry.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        pointLayer.addFeatures(point);
        pointLayer.drawFeature(point);
        clearOldPoints(point);
        map.setCenter([pointLayer.features[0].geometry.x, pointLayer.features[0].geometry.y], zoom);
        pointLayer.redraw()
    }

    map.addLayers([hybrid, pointLayer]);

    map.addControl(point);
    point.activate();

    map.setCenter(new OpenLayers.LonLat(-120, 45), 4);
}