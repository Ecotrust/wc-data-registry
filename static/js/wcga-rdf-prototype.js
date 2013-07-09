var app = {};
var facets = ["keywords"];
var solr_url = settings_solr_url;
var gp_url = settings_gp_url;

function viewModel() {
    var self = this;


    //HOME PAGE
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
    self.displayRows = ko.observable(5);
    self.startIndex = ko.observable(0);
    self.recordPaginator = ko.observable("");
    self.pageCount = ko.observable(0);
    self.displayPages = ko.observable(5);
    self.pageIndex = ko.observable(0);

    self.queryFilter = ko.observableArray();

    self.useBb.subscribe(function(val){
        app.runQuery(app.defaultQueryCallback);
    });

    //RECORD PAGE
    self.record_id = ko.observable("");
    self.record_title = ko.observable("");
    self.record_abstract = ko.observable("");
    self.record_originator = ko.observable("");
    self.record_updated = ko.observable("");
    self.record_source = ko.observable("");



}

app.viewModel = new viewModel();
ko.applyBindings(app.viewModel);
window.location.hash.replace('#', '');

function load() {

    init();      //Init the map

    if (getURLParameter('search')) {
        app.viewModel.search(getURLParameter('search'));
    }
    
    if (getURLParameter('keywords')) {
        for (var i = 0; i < JSON.parse(getURLParameter('keywords')).length; i++){
            app.viewModel.keywords()[JSON.parse(getURLParameter('keywords'))[i].toLowerCase()] = 1;
        }
    }
    
    if (getURLParameter('useBb').toLowerCase() == "true" && getURLParameter('lat') && getURLParameter('lon')) {
        app.viewModel.useBb(true);
        app.viewModel.bbLat(getURLParameter('lat'));
        app.viewModel.bbLon(getURLParameter('lon'));
        updateMap({
            'latlng':{
                'lat': app.viewModel.bbLat(),
                'lng': app.viewModel.bbLon()
            }
        });
    }

    if (app.viewModel.search() == "" && !app.viewModel.useBb() && isEmpty(app.viewModel.keywords())) {
        app.runQuery(function(data) { /* process e.g. data.response.docs... */ 
                var items = [];
                app.viewModel.totalRecordsCount(data.response.numFound.toString());
                console.log(data);
                app.viewModel.currentRecords(data);
                app.updateKeywords();
                app.viewModel.recordPaginator(app.buildPaginator());
            }
        );
    } else {
        app.runQuery(app.defaultQueryCallback);
    }

}

function load_record() {
    init();

    if (getURLParameter('id')) {
        app.viewModel.record_id(getURLParameter('id'));
        getRecord(app.viewModel.record_id());
    }
}

app.updateKeywords = function() {
    html = "<div class=\"row-fluid\"><div class=\"span12\" id =\"keyword-html\">";

    $.each(app.viewModel.keywords(), function(key, val){
        html = html + "<div class=\"row-fluid selected-keyword\"><div class=\"span10 selected-keyword\">" + key + "</div>" +
        "<div class=\"span2 selected-keyword\"><img src='static/img/cross.png' onclick='app.removeKeyword(\"" + key + "\")'/></div></div>";
    });

    var facet_keywords = app.viewModel.currentRecords().facet_counts.facet_fields.keywords;

    for (var i=0, j = 0; j < 10 && i < facet_keywords.length; i = i+2) {
        var kw = facet_keywords[i];
        if (!app.viewModel.keywords()[kw]) {
            var count = facet_keywords[i+1];
            html = html + "<div class=\"row-fluid\"><div class=\"span12\"><a onclick='kwSearch(\"" + kw + "\", " + count + ")''>" + kw + " (" + count + ")</a></div></div>";
            j++;
        }
    }
    app.viewModel.keywordsDisplay(html);
};

function kwSearch(keyword, count){
    app.viewModel.pageIndex(0);
    app.viewModel.startIndex(0);
    app.viewModel.keywords()[keyword] = count;
    app.runQuery(app.defaultQueryCallback);
}

app.removeKeyword = function(keyword){
    delete app.viewModel.keywords()[keyword];
    app.viewModel.startIndex(0);
    app.viewModel.pageIndex(0);
    app.updateKeywords();
    app.runQuery(app.defaultQueryCallback);

}

function unwrap(lst){
    var fullList = [];
    var maxDesc = 300;
    if (lst.id) {
        fullList.push('<div id = "' + lst.id + '" class="record" onclick="window.location=\'record.html?id=' + lst.id + '\'">');
    } else {
        fullList.push('<div class="record">');
    }
    if (lst.title) {
        fullList.push('<h3 class="record-title">' + lst.title[0] + '</h3>');
    } else {
        fullList.push('<h3 class="record-title">' + 'No Title Provided' + '</h3>');
    }
    if (lst.description) {
        fullList.push('<p class="record-abstract">' + lst.description.slice(0, maxDesc));
        if (lst.description.length > maxDesc){
            fullList.push('...');
        }
        fullList.push('</p>');
    } else {
        fullList.push('<p class="record-abstract">' + 'No description provided.' + '</p>');
    }

    if (lst["sys.src.item.lastmodified_tdt"]) {
        var date = new Date(lst["sys.src.item.lastmodified_tdt"]);
        var date_string = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
        fullList.push('<p class="record-date">Last updated: ' + date_string + '</p>');
    }

    fullList.push('</div>');

    return fullList.join('');
};

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
    var rec_id = id.slice(0,8) + '-' + id.slice(8,12) + '-' + id.slice(12,16) + '-' + id.slice(16,20) + '-' + id.slice(20);
    var url = gp_url + '/rest/document';
    $.ajax({
        // type: 'Get',
        url: url,
        data: {
            'id': rec_id,
            // 'id': '%7B' + rec_id + '%7D',
            'f':'pjson'
        },
        dataType: 'text',  
        // jsonp: false,
        // crossDomain: true,
        // jsonpCallback: "callback",
        success: function(val){
            alert(val);
        }
    });
}

app.submit = function () {
    app.viewModel.pageIndex(0);
    app.viewModel.startIndex(0);
    app.runQuery(app.defaultQueryCallback);
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
    
    $("button").click(app.submit);
    $("#search-bar").on('keypress', function(e){
        if (e.keyCode == 13){
            e.preventDefault();
            app.viewModel.search($('#search-bar').val());
            app.submit();
        }
    })
});

app.runQuery = function(callback){
    app.viewModel.q_query("{!lucene q.op=AND df=text}");

    //Free text search
    if (app.viewModel.search().length > 0){
        app.viewModel.q_query(app.viewModel.q_query() + app.viewModel.search() + " ");
    } else {
        app.viewModel.q_query(app.viewModel.q_query() + "* ");
    }

    //keyword search

    if (!isEmpty(app.viewModel.keywords())) {

        var keywords = '(';
        var count = 0;
        $.each(app.viewModel.keywords(), function(key, val){
            if (count > 0) {
                keywords = keywords + ' AND ';
            }
            keywords = keywords + key;
            count++;
        });

        keywords = keywords + ')';

        if (keywords.length > 0) {
           app.viewModel.q_query(app.viewModel.q_query() + "keywords: " + keywords + " "); 
        }
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
        callback
    );
}

//FROM: http://stackoverflow.com/a/679937
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

app.buildPaginator = function() {
    var paginator = [];
    app.viewModel.pageCount(Math.ceil(app.viewModel.numFound()/app.viewModel.displayRows()));
    paginator.push('<div class="pagination">');
    paginator.push('<ul>');
    if (app.viewModel.startIndex() == 0) {
        paginator.push(app.buildPaginatorButton("&laquo;", "&laquo;", "disabled"));
    } else {
        paginator.push(app.buildPaginatorButton("&laquo;", "&laquo;", false));
    }

    if (app.viewModel.pageCount() < app.viewModel.displayPages()) {
        var ceiling = app.viewModel.pageCount();
    } else {
        var ceiling = app.viewModel.displayPages();
    }

    for (var i = app.viewModel.pageIndex(); i < app.viewModel.pageIndex() + ceiling; i++) {       //displayPages, pageIndex
        if ((app.viewModel.startIndex() + i == 0) || (app.viewModel.startIndex() / (i * app.viewModel.displayRows())) == 1) {
            paginator.push(app.buildPaginatorButton(i, i+1, "active"));
        } else {
            paginator.push(app.buildPaginatorButton(i, i+1, false));
        }
    }
    if ((app.viewModel.startIndex() + app.viewModel.displayRows()) >= app.viewModel.numFound()) {
        paginator.push(app.buildPaginatorButton("&raquo;", "&raquo;", "disabled"));
    } else {
        paginator.push(app.buildPaginatorButton("&raquo;", "&raquo;", false));
    }
    return paginator.join('');
}

app.buildPaginatorButton = function(val, text, status) {
    if (status) {
        return '<li class="' + status + '"><span>' + text + '</span></li>';
    } else {
        return '<li><a href="#" onclick="app.pageButton(\'' + val + '\')">' + text + '</a></li>';
    }

}

app.pageButton = function(button) {
    switch(button) {
        case '«':
            app.viewModel.startIndex(0);
            app.viewModel.pageIndex(0);
            break;
        case '»':
            app.viewModel.startIndex((app.viewModel.pageCount() - 1) * app.viewModel.displayRows());
            if (app.viewModel.pageCount() > app.viewModel.displayPages()){
                app.viewModel.pageIndex(app.viewModel.pageCount() - app.viewModel.displayPages());
            } else {
                app.viewModel.pageIndex(0);
            }
            break;
        default:
            app.viewModel.startIndex(parseInt(button) * app.viewModel.displayRows());
            var intBtn = parseInt(button);
            var deviation = Math.floor(app.viewModel.displayPages() / 2);
            if (intBtn > deviation && app.viewModel.pageCount > app.viewModel.displayPages()) {
                if (intBtn + deviation < app.viewModel.pageCount()) {
                    app.viewModel.pageIndex(parseInt(button) - Math.floor(app.viewModel.displayPages() / 2));
                } else {
                    app.viewModel.pageIndex(app.viewModel.pageCount() - app.viewModel.displayPages());
                }
            } else {
                app.viewModel.pageIndex(0);
            }
            break;
    }
    app.runQuery(app.defaultQueryCallback);
}

app.defaultQueryCallback = function(data){
    var items = [];
    app.viewModel.numFound(data.response.numFound.toString());

    console.log(data);
    items.push('<div id="results-box">');
    if (data.response.docs.length > 0){
        $.each(data.response.docs, function(key1, val1){
            items.push(unwrap(val1));
        });
    } else {
        items.push('<h2>No items match your query.</h2>');
    }
    items.push('</div>');
    app.viewModel.resultsDisplay(items.join(''));
    app.viewModel.recordPaginator(app.buildPaginator());
    app.viewModel.currentRecords(data);
    app.updateKeywords();

}

//FROM: http://stackoverflow.com/a/8764051
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}