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
            'theme/default/less',
            'theme/blue/less'
          ]
        },
        files: [
          {
            'geonode/css/base.css': 'theme/default/less/base.less',
            'theme/default/css/font-awesome.css': 'vendor/fontawesome/css/font-awesome.css',
            'theme/blue/css/font-awesome.css': 'vendor/fontawesome/css/font-awesome.css',
            'theme/blue/fonts/lato_font.css': 'vendor/lato-font/css/lato-font.css',
            'theme/default/fonts/lato_font.css': 'vendor/lato-font/css/lato-font.css'
          },
          {
            expand: true,
            cwd: 'theme/default/less',
            src: ['*.less', '!*-variables.less', '!maploom.less'],
            dest: 'theme/default/css/',
            ext: '.css'
          },
          {
            expand: true,
            cwd: 'theme/blue/less',
            src: ['*.less', '!*-variables.less', '!maploom.less'],
            dest: 'theme/blue/css/',
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

    copy: {
      development: {
        files: [{
          src: ['vendor/fontawesome/fonts/*'],
          dest: 'theme/default/fonts/',
          expand: true,
          flatten: true,
          filter: 'isFile'
        },{
          src: ['vendor/fontawesome/fonts/*'],
          dest: 'theme/blue/fonts/',
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]
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
        files: ['theme/default/less/*.less'],
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-subgrunt');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('watchall', ['less:development', 'concurrent:watch']);

  // test
  grunt.registerTask('test', ['jshint']);

  // build development
  grunt.registerTask('default', ['jshint', 'less:development', 'replace', 'copy:development']);

  // build production
  grunt.registerTask('production', ['jshint', 'less:production', 'replace', 'copy:development' ]);

};
