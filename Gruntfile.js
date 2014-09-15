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
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['uglify']);
}