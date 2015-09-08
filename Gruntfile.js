module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      my_target: {
        files: [{
            expand: true,
            cwd: '_site_generated/assets/',
            src: '**/*.js',
            dest: './_site_generated/assets/'
        }]
      }
    },
    cssmin: {
      my_target: {
        files: [{
          expand: true,
          cwd: '_site_generated/assets/css/',
          src: ['*.css', '!*.min.css'],
          dest: '_site_generated/assets/css/',
          ext: '.css'
        }]
      }
    },
    karma: {  
      unit: {
        options: {
          frameworks: ['jasmine'],
          singleRun: false,
          browsers: ['Chrome'],
          files: [
            'site_raw/_includes/bower_components/jquery/jquery.js',
            'site_raw/_includes/bower_components/underscore/underscore.js',
            'site_raw/_includes/bower_components/angular/angular.js',
            'site_raw/_includes/bower_components/angular-mocks/angular-mocks.js',
            'tests/conf/test_setup.js',
            'site_raw/_includes/js/services/Metadata.js',
            'tests/*.js'
          ]
        }
      }
    }    
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('default', ['uglify', 'cssmin']);
  grunt.registerTask('test', ['karma']);
}