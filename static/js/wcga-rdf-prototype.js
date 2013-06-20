var app = {};

function viewModel() {
    var self = this;

    self.keywords = ko.observable("");
    self.title = ko.observable("");
    self.extension = ko.observable("");
    self.resultsDisplay = ko.observable("");
    self.numFound = ko.observable("");
    self.q_query = ko.observable("");
    self.bbLat = ko.observable("");
    self.bbLon = ko.observable("");
    self.useBb = ko.observable("");

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

$('#location-tab').on('shown', function (e) {
     init();    //Init the map
});


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
    }
    
    $("button").click(function(){

        app.viewModel.q_query("{!lucene q.op=AND df=text}");

        //Keyword search
        if (app.viewModel.keywords().length > 0){
            app.viewModel.q_query(app.viewModel.q_query() + app.viewModel.keywords() + " ");
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

        $.ajax({
            url: 'http://localhost:8983/solr/collection1/select',
            data: {
                'wt':'json', 
                'q':app.viewModel.q_query(), 
                'fl':'id, title, description, keywords, envelope_geo, sys.src.item.lastmodified_tdt'
            },
            success: function(data) { /* process e.g. data.response.docs... */ 
                var items = [];
                app.viewModel.numFound(data.response.numFound.toString());

                console.log(data);
                $.each(data.response, function(key1, val1){
                    items.push(unwrap(val1, 0));
                });
                app.viewModel.resultsDisplay(items.join(''));
            },
            dataType: 'jsonp',
            jsonp: 'json.wrf'
        });
    });
});