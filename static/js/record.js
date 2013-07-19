var app = {};
var facets = ["keywords"];
var solr_url = settings_solr_url;
var gp_url = settings_gp_url;

function viewModel() {
    var self = this;

    //RECORD PAGE
    self.record_id = ko.observable("");
    self.record_title = ko.observable("");
    self.record_abstract = ko.observable("");
    self.record_originator = ko.observable("");
    self.record_updated = ko.observable("");
    self.record_source = ko.observable("");
    self.record_bbox = ko.observable();
    self.api_addr = ko.observable("");
}

app.viewModel = new viewModel();
ko.applyBindings(app.viewModel);
window.location.hash.replace('#', '');

function load_record() {
    init();

    if (getURLParameter('id')) {
        app.viewModel.record_id(getURLParameter('id'));
        app.viewModel.api_addr(gp_url + "/rest/document?id=" + app.viewModel.record_id());
        getRecord(app.viewModel.record_id());
    }
}

function querySolr(q, fq, fl, wt, callback) {
    var mincount = 1;
    //Cannot figure out how to search multiple facets with jquery ajax syntax. Using for loop instead.
    var url = solr_url;
    for (var i = 0; i<facets.length; i++) {
        url = url + 'facet.field=' + facets[i] + '&facet.mincount=' + mincount + '&';
    }

    $.ajax({
        url: url,
        data: {
            'start': app.viewModel.startIndex(),
            'rows': app.viewModel.displayRows(),
            'wt':wt, 
            'q':q, 
            'fq': fq,
            'fl':fl,
            'facet':true
        },
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: callback
    });
}

function getRecord(id){
    var rec_id = id;
    var url = gp_url + '/rest/document';
    $.ajax({
        url: url,
        data: {
            'id': rec_id,
            'f':'pjson'
        },
        dataType: 'json',  
        success: function(raw_response){
            var response = raw_response.records[0];
            app.viewModel.record_id(response.id);
            app.viewModel.record_title(response.title);
            app.viewModel.record_abstract(response.summary);
            app.viewModel.record_updated(response.updated);
            app.viewModel.record_bbox(response.bbox);
            showBbox();
        }
    });
}

//FROM: http://stackoverflow.com/a/679937
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

//FROM: http://stackoverflow.com/a/8764051
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
