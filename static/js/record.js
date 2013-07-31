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

$(document).ready(function(){
    $(".navbar-title").on('click', function(e){
        window.location = 'index.html';
    });
});

function load_record() {
    init();

    if (getURLParameter('id')) {
        app.viewModel.record_id(getURLParameter('id'));
        // app.viewModel.api_addr(gp_url + "/rest/document?id=" + app.viewModel.record_id());
        getSolrRecord(app.viewModel.record_id());
        getGPRecord(app.viewModel.record_id());
        app.viewModel.api_addr(solr_url + "q=id:" + app.viewModel.record_id().replace(/\W/g, '').toLowerCase() + "&wt=json&indent=true");
    }
}

function getSolrRecord(id){
    var rec_id = id;
    var url = solr_url;
    $.ajax({
        url: url,
        data: {
            'q': "id:" + rec_id.replace(/\W/g, '').toLowerCase(),
            'wt':'json'
        },
        dataType: 'jsonp',  
        jsonp: 'json.wrf',
        success: function(raw_response){
            var response = raw_response.response.docs[0];
            app.viewModel.record_id(response.id);
            app.viewModel.record_title(response.title);
            app.viewModel.record_abstract(response.description);
            // app.viewModel.record_updated(Date.parseExact(response["sys.src.item.lastmodified_tdt"].slice(0,-5).replace("T", " "), "yyyy-mm-dd HH:mm:ss").toString("M/d/yyyy hh:mm tt"));
                // The tenths, hundredths, etc... of a second mess with datejs. If we call both Solr & GP then GP is easier to parse.
        }
    });
}

function getGPRecord(id){
    var rec_id = id;
    var url = gp_url + '/rest/document';
    $.ajax({
        url: url,
        data: {
            'id': rec_id,
            'f': 'pjson'
        },
        dataType: 'json',
        success: function(raw_response){
            var response = raw_response.records[0];
            app.viewModel.record_updated(Date.parse(response.updated).toString("M/d/yyyy hh:mm tt"));
            app.viewModel.record_bbox(response.bbox);
            showBbox();
        }
    });
}

//FROM: http://stackoverflow.com/a/8764051
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
