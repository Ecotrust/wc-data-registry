wc-data-registry
================

Data Registry for the West Coast Governors Alliance

Quick Start
===========
Install Bower:

    npm install -g bower

Install Jekyll:

    gem install jekyll
    
Install Grunt
    sudo npm install -g grunt-cli
    sudo npm install grunt-contrib-uglify --save-dev

Clone this repository using your git client of choice.

Then install the dependencies via bower. From the root repository directory:

    bower install
    
And run the Jekyll server such that it auto compiles any code updates:

    jekyll serve --watch

To change the URL that the app connects to for Geoportal change scope.geoportalUrl in:

    site_raw/_includes/js/directives/Results.js

To change the URL that the app connects to for SOLR change solrUrl in:

    site_raw/_includes/js/services/Solr.js

If you need to change either of those URLs to a different domain than this application is being served from (for testing purposes) you will want to temporarily allow cross-domain AJAX requests using a CORS plugin such as the "Allow-Control-Allow-Origin" extension for Chrome

To get this ready for production run the following:
    jekyll build
    grunt

This should then compile all the JS into one file, then minify it -> going from ~1.2M of JS to 340K

### Compiling LESS to CSS
This project does not have a built in Less compiler. To compile the CSS make your edits to site_raw/_includes/less/main.less then use a third party Less compiler and put the output into site_raw/_includes/css/main.css