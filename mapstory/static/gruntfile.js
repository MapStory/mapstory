module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      // files to lint
      files: ['gruntfile.js'],
      // configure JSHint (see http://www.jshint.com/docs/)
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    less: {
      development: {
        options: {
          paths: [
            'mapstory/less'
          ]
        },
        files: [
          {
            'geonode/css/base.css': 'mapstory/less/base.less',
          },
          {
            expand: true,
            cwd: 'mapstory/less',
            src: ['*.less', '!*-variables.less', '!maploom.less'],
            dest: 'mapstory/css/',
            ext: '.css'
          }
        ]
      },
      production: {
        options: {
          yuicompress: true
        },
        files: [
          {
            'geonode/css/base.css': 'geonode/less/base.less'
          }
        ]
      }
    },

    replace: {
      development: {
        src: ['lib/css/*.css'],
        overwrite: true,
        replacements: [{ 
          from: /url\((("?images\/)|('(?!(images|\.)))|(?!('|"))|('\.\.\/images\/))/g,
          to: 'url(\'../img/'
        }, {
          from: /(png|gif|jpg)+(\)|'\)|"\))/g, 
          to: '$1\')'
        }]
      }
    },

    // automated build on file change during development
    watch: {
      options: {
        // prevent conflict with maploom
        livereload: 35730
      },
      less: {
        files: ['mapstory/less/*.less'],
        tasks: ['less:development']
      }
    },

    subgrunt: {
      watchmaploom: {
        projects: {
          '../../../MapLoom/': 'delta'
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      watch: {
        tasks: ['watch', 'subgrunt:watchmaploom']
      }
    }
  });

  // Load libs
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-subgrunt');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('watchall', ['concurrent:watch']);

  // test
  grunt.registerTask('test', ['jshint']);

  // build development
  grunt.registerTask('default', ['jshint', 'less:development', 'replace']);

  // build production
  grunt.registerTask('production', ['jshint', 'less:production', 'replace' ]);

};
