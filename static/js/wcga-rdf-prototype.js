var app = {};
var facets = ["keywords", "manu"];

function viewModel() {
    var self = this;

    self.totalRecordsCount = ko.observable(0);
    self.currentRecords = ko.observable({});
    self.search = ko.observable("");
    self.title = ko.observable("");
    self.keywords = ko.observable({});
    self.keywordsDisplay = ko.observable("");
    self.resultsDisplay = ko.observable("");
    self.numFound = ko.observable("");
    self.q_query = ko.observable("");
    self.fq_query = ko.observable("");
    self.bbLat = ko.observable("");
    self.bbLon = ko.observable("");
    self.useBb = ko.observable(false);

    self.queryFilter = ko.observableArray();

    self.fromDate = ko.observable();
    self.fromDatePick = $("#fromDate").datepicker().on('changeDate', function(ev) {
        self.fromDate(self.fromDatePick.date);
        self.fromDatePick.hide();
    }).data('datepicker');

      self.toDate = ko.observable();
    self.toDatePick = $("#toDate").datepicker().on('changeDate', function(ev) {
        self.toDate(self.toDatePick.date);
        self.toDatePick.hide();
    }).data('datepicker');

    self.removeDate = function (self, event) {
        if ($(event.target).closest('.input-append')[0].id == "to") {
            self.toDate(undefined);
            $("#toDate")[0].value = "";
        } else {
            self.fromDate(undefined);
            $("#fromDate")[0].value = "";
        }
        $(event.target).closest('.input-append').find('input').datepicker().trigger('change');
    }

    self.updateCoordVals = function(lon, lat) {
        self.bbLat(lat.toFixed(6).toString());
        self.bbLon(lon.toFixed(6).toString());
    }
}

app.viewModel = new viewModel();
ko.applyBindings(app.viewModel);
window.location.hash.replace('#', '');

function load() {
    querySolr(
        '*', 
        '',
        '',
        'json',
        function(data) { /* process e.g. data.response.docs... */ 
            var items = [];
            app.viewModel.totalRecordsCount(data.response.numFound.toString());
            console.log(data);
            app.viewModel.currentRecords(data);
            app.updateKeywords();
        }
    );
    init();      //Init the map
}

app.updateKeywords = function() {
    html = "<div class=\"row-fluid\"><div class=\"span12\" id =\"keyword-html\">";
    for (var i=0; i < 20; i=i+2) {
        var kw = app.viewModel.currentRecords().facet_counts.facet_fields.keywords[i];
        var count = app.viewModel.currentRecords().facet_counts.facet_fields.keywords[i+1];
        html = html + "<div class=\"row-fluid\"><div class=\"span12\"><a onclick='kwSearch(\"" + kw + "\")''>" + kw + " (" + count + ")</a></div></div>";
    }
    app.viewModel.keywordsDisplay(html);
};

function kwSearch(keyword){
    if (app.viewModel.q_query().length == 0) {
        app.viewModel.q_query("{!lucene q.op=AND df=text}")
    }
    app.viewModel.q_query(app.viewModel.q_query() + "keywords: \"" + keyword + "\" ");

    querySolr(
        app.viewModel.q_query(), 
        '',
        '',
        'json',
        app.defaultQueryCallback
    );
}

function unwrap(lst, depth){
    fullList = [];
    fullList.push('<dl>');
    for(var i=0; i<lst.length; i++){
        if (depth == 0){
            fullList.push('<hr />');
        }
        $.each(lst[i], function(key, val){
            if(typeof val == 'object'){
                if (typeof val[0] == 'string'){
                    fullList.push('<dt id="' + key + '">' + key + '</dt><dd> [<ul>')
                    for (var j=0; j<val.length; j++){
                        fullList.push('<li>' + val[j] + '</li>')
                    }
                    fullList.push('</ul>]</dd>')
                } else {
                    fullList.push('<dt id="' + key + '">' + key + '</dt><dd>' + unwrap(val, depth+1) + '</dd>')
                }
            } else {
                fullList.push('<dt id="' + key + '">' + key + '</dt><dd>' + val + '</dd>')
            }
        });
    }
    fullList.push('</dl>');
    return fullList.join('');
};

function querySolr(q, fq, fl, wt, callback) {

    //Cannot figure out how to search multiple facets with jquery ajax syntax. Using for loop instead.
    var url = 'http://localhost:8983/solr/collection1/select?';
    for (var i = 0; i<facets.length; i++) {
        url = url + 'facet.field=' + facets[i] + '&';
    }

    $.ajax({
        url: url,
        data: {
            'wt':wt, 
            'q':q, 
            'fq': fq,
            'fl':fl,
            'facet':true
            // 'facet.limit': 10
        },
        dataType: 'jsonp',
        jsonp: 'json.wrf',
        success: callback
    });
}

$(document).ready(function(){

    var formatDate = function(date_obj, limit){
        if (date_obj != '*') {
            var year = date_obj.getFullYear().toString();
            var month = date_obj.getMonth() + 1;
            if (month < 10) {
                month = "0" + month.toString();
            } else {
                month = month.toString();
            }
            var day = date_obj.getDate();
            if (day < 10) {
                day = "0" + day.toString();
            } else {
                day = day.toString();
            }
            var stamp = "";
            if (limit == 'to') {
                stamp = "T12:59:59.9Z";
            } else {
                stamp = "T00:00:00.0Z";
            }

            return year + "-" + month + "-" + day + stamp;
        } else {
            return date_obj;
        }
    };
    
    $("button").click(function() {
        app.runQuery("{!lucene q.op=AND df=text}");
    });
});

app.runQuery = function(q_query){
    app.viewModel.q_query(q_query);

    //Free text search
    if (app.viewModel.search().length > 0){
        app.viewModel.q_query(app.viewModel.q_query() + app.viewModel.search() + " ");
    } else {
        app.viewModel.q_query(app.viewModel.q_query() + "* ");
    }

    //Date Search
    if (app.viewModel.fromDate() != undefined || app.viewModel.toDate() != undefined) {
        if (app.viewModel.fromDate() == undefined){
            app.viewModel.fromDate('*');
        }

        if (app.viewModel.toDate() == undefined){
            app.viewModel.toDate('*');
        }
        app.viewModel.q_query(app.viewModel.q_query() + "sys.src.item.lastmodified_tdt:[" + formatDate(app.viewModel.fromDate(), 'from') + " TO " +
            formatDate(app.viewModel.toDate(), 'to') + "] ");
    }

    if (app.viewModel.useBb() && app.viewModel.bbLat() != "" && app.viewModel.bbLon() != "") {
        app.viewModel.fq_query("{!bbox pt=" + app.viewModel.bbLat() + "," + app.viewModel.bbLon() + " sfield=envelope_geo d=0.001} ");
    } else {
        app.viewModel.fq_query("");
    }

    querySolr(
        app.viewModel.q_query(), 
        app.viewModel.fq_query(),
        'id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt',
        'json',
        app.defaultQueryCallback
    );
}

app.defaultQueryCallback = function(data){
    var items = [];
    app.viewModel.numFound(data.response.numFound.toString());

    console.log(data);
    $.each(data.response, function(key1, val1){
        items.push(unwrap(val1, 0));
    });
    app.viewModel.resultsDisplay(items.join(''));
    app.viewModel.currentRecords(data);
    app.updateKeywords();
}