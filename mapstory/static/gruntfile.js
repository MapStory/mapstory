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
            'style/themes/',
            'style/fonts/',
            'style/map/'
          ]
        },
        files: [
          {
            'style/themes/default.css':'style/themes/default.less',
            'style/themes/blue.css':'style/themes/blue.less',
            'style/themes/orange.css':'style/themes/orange.less',
            //font-awesome.css must be in a niece directory from its files due to vendor code
            'style/sitebase/font-awesome.css':'vendor/fontawesome/css/font-awesome.css',
            'style/fonts/lato_font.css':'vendor/lato-font/css/lato-font.css'
          },
          {
            expand: true,
            cwd: 'style/map/less',
            src: ['*.less', '!*-variables.less'],
            dest: 'style/map/css/',
            ext: '.css'
          }
        ]
      }
      //TODO, PRODUCTION, minification, less linting
    },

    copy: {
      development: {
        files: [{
          src: ['vendor/fontawesome/fonts/*'],
          dest: 'style/fonts/',
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
        files: [
          'style/sitebase/*.less',
          'style/themes/*.less',
          'style/map/less/*.less'
          ],
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
