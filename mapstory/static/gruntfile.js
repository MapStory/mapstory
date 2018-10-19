module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['mapstory/js/src/**/*.js', 'mapstory/js/spec/*.js'],
      options: {
        force: true,
        //Bypass`'$' is not defined` errors
        '-W117': true,
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    lesslint: {
      src: ['style/themes/**/maps.less', 'style/themes/**/site.less'],
      options: {
        less: {
          paths: ['includes']
        },
        failOnError: false
      }
    },

    karma: {  
      unit: {
         configFile: 'karma.conf.js'
      }
    },

    concat: {  
      options: {},
      mapstory: {
        files: {
          'mapstory/js/dist/mapstory.js': [
            // mapstory module
            'mapstory/js/src/mapstory.module.js',
            'mapstory/js/src/*.js',
            // search module
            'mapstory/js/src/search/search.module.js',
            'mapstory/js/src/search/**/*.js',
            // exclude test files
            '!mapstory/js/**/*.spec.js'
          ],
          // simply copy geogig from src to dist for now
          'mapstory/js/dist/mapstory.geogig.js':[
            'mapstory/js/src/mapstory.geogig.js'
          ]
        }
      },
      vendor:{
        files: {
           'mapstory/js/dist/vendor-assets-min.js':[
            'vendor/jquery/dist/jquery.min.js',
            'vendor/bootstrap/dist/js/bootstrap.min.js',
            'vendor/angular/angular.min.js',
            'vendor/angular-animate/angular-animate.min.js',
            'vendor/angular-aria/angular-aria.min.js',
            'vendor/angular-material/angular-material.min.js',
            'vendor/clipboard/dist/clipboard.min.js'
          ]
        }
      },
    },

    less: {
      development: {
        options: {
          paths: [
            'style/themes/',
            'style/fonts/'
          ]
        },
        files: [
          {
            //font-awesome.css must be in a niece directory from its files due to vendor code
            'style/site/font-awesome.css':'vendor/fontawesome/css/font-awesome.css',
            'style/fonts/lato_font.css':'vendor/lato-font/css/lato-font.css'
          },
          {
            expand: true,
            cwd: 'style/themes',
            src: ['orange/**.less', 'blue/**.less', 'default/**.less', '!*/brandcolors.less'],
            dest: 'style/themes/',
            ext: '-theme.css'
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
          'style/site/*.less',
          'style/maps/*.less',
          'style/themes/**/*.less'  
          ],
        tasks: ['less:development']
      },
      concat: {
        files: [
          'mapstory/js/src/**/*.js'
        ], 
        tasks: ['concat:mapstory']
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-lesslint');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-subgrunt');

  grunt.registerTask('watchall', ['less:development', 'concurrent:watch']);

  // todo: init .lesshintrc and jshint configs to reflect our style guidelines
  grunt.registerTask('lint', ['jshint', 'lesslint']);

  // test -- to run this locally you may have to `npm rebuild` for correct phantom binary file
  grunt.registerTask('test', ['concat:mapstory', 'karma']);

  // build development
  grunt.registerTask('default', ['concat:mapstory', 'concat:vendor', 'less:development', 'replace', 'copy:development']);

  // build production
  grunt.registerTask('production', ['concat:mapstory', 'concat:vendor', 'less:development', 'replace', 'copy:development' ]);

};
