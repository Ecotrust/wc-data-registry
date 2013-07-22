var app = {};
var facets = ["keywords"];
var solr_url = settings_solr_url;
var gp_url = settings_gp_url;

function viewModel() {
    var self = this;
    //HOME PAGE
    self.numFound = ko.observable("");
    self.search = ko.observable("");
    self.bbLat = ko.observable("");
    self.bbLon = ko.observable("");
    self.useBb = ko.observable(false);
}

app.viewModel = new viewModel();
ko.applyBindings(app.viewModel);
window.location.hash.replace('#', '');

function load() {
    init();      //Init the map
    app.querySolr(function(data){
       app.viewModel.numFound(data.response.numFound.toString());
    });
}

app.submit = function () {
    var destination = 'discover.html';
    if (app.viewModel.search() != "") {
        destination = destination + "?search="+app.viewModel.search()
    } else if (app.viewModel.useBb()) {
        destination = destination + "?useBb=true&lat=" + app.viewModel.bbLat() + "&lon=" + app.viewModel.bbLon();
    }
    window.location = destination;
}

$(document).ready(function(){
    $("#search-button").click(app.submit);
    $("#search-bar").on('keypress', function(e){
        if (e.keyCode == 13){
            e.preventDefault();
            app.viewModel.search($('#search-bar').val());
            app.submit();
        }
    });
    $(".navbar-title").on('click', function(e){
        window.location = 'index.html';
    });

});

app.querySolr = function (callback) {
    var mincount = 1;
    var url = solr_url;
    
    $.ajax({
        url: url,
        data: {
            'wt':'json',
            'q':"{!lucene q.op=AND df=text}*"
        },
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: callback
    });
}

