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
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.registerTask('default', ['uglify', 'cssmin']);
}