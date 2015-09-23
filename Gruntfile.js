module.exports = function(grunt) {
  grunt.initConfig({

    //Compile LESS files
    less: {
      compile: {
        options: {
          // These paths are searched when trying to resolve @import in less file
          paths: [
            'site_raw/_includes/less'
          ]
        },
        files: {
          'site_raw/_includes/css/main.css': 'site_raw/_includes/less/main.less'
        }
      }
    },

    //Watch LESS files and recompile on change
    watch: {
      styles: {
        files: [
          'site_raw/_includes/less/*'
        ],
        tasks: 'less'
      }
    },

    //Compress Javascript files
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

    //Compress CSS files
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

    //Run test suite
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
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.registerTask('styles', ['less','watch']);
  grunt.registerTask('compress', ['uglify', 'cssmin']);
  grunt.registerTask('test', ['karma']);
}