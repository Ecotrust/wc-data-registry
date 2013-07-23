var app = {};

window.location.hash.replace('#', '');

function load() {
    // init();      //Init the map
}

$(document).ready(function(){
    $(".navbar-title").on('click', function(e){
        window.location = 'index.html';
    });
});