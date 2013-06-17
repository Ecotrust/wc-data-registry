var app = {};


function viewModel() {
	var self = this;

	self.keywords = ko.observable("");
	self.resultsDisplay = ko.observable("");
	self.numFound = ko.observable("");

	self.queryFilter = ko.observableArray();

	self.removeDate = function (self, event) {
		$(event.target).closest('.input-append')
		.find('input')
		.datepicker( "setDate", null )
		.trigger('change');
	};

	self.activeFilterTypes = ko.computed(function (type) {
    var filterSet={}, filterList=[];
    if (self.queryFilter().length) {
      $.each(self.queryFilter(), function (i, filter) { 
        if (filter.type !== 'point' && filter.type !== 'report') {
          filterSet[filter.type] = true;
        }
      });
      $.each(filterSet, function (key, x) {
        filterList.push(key);
      });  
    }
    
    return filterList;
  });

}

app.viewModel = new viewModel();
ko.applyBindings(app.viewModel);

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
  $("button").click(function(){

	$.ajax({
	  	url: 'http://localhost:8983/solr/collection1/select',
	  	// type: 'GET',
	  	// 'dataType': 'json',
	  	//serialize the form
	  	data: {
	  		'wt':'json', 
	  		'q':app.viewModel.keywords(), 
	  		'fl':'id, title, description, keywords, envelope_geo'
	  	},
	  	success: function(data) { /* process e.g. data.response.docs... */ 
	  		var items = [];
	  		app.viewModel.numFound(data.response.numFound.toString());

  			console.log(data);
			$.each(data.response, function(key1, val1){
				items.push(unwrap(val1, 0));
				// if(typeof val1 == 'object'){
				// 	items.push('<dt id="' + key1 + '">' + key1 + '</dt><dd>' + unwrap(val1, 0) + '</dd>');
				// } else {
				// 	items.push('<dt id="' + key1 + '">' + key1 + '</dt><dd>' + val1 + '</dd>');
				// }
			});
	  		app.viewModel.resultsDisplay(items.join(''));
		    },
	  	dataType: 'jsonp',
	  	jsonp: 'json.wrf'
	});

  });
});