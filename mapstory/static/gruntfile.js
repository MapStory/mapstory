module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['mapstory/js/**/mapstory.js', 'mapstory/js/**/search.js'],
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

    less: {
      development: {
        options: {
          paths: [
            'style/themes/',
            'style/fonts/'
          ]
        },
        files: [{
          //font-awesome.css must be in a niece directory from its files due to vendor code
          'style/site/font-awesome.css': 'vendor/fontawesome/css/font-awesome.css',
          'style/fonts/lato_font.css': 'vendor/lato-font/css/lato-font.css'
        }, {
          expand: true,
          cwd: 'style/themes',
          src: ['orange/**.less', 'blue/**.less', 'default/**.less', '!*/brandcolors.less'],
          dest: 'style/themes/',
          ext: '-theme.css'
        }]
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
  grunt.loadNpmTasks('grunt-lesslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-subgrunt');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('watchall', ['less:development', 'concurrent:watch']);

  // test
  grunt.registerTask('lint', ['jshint', 'lesslint']);

  // build development
  grunt.registerTask('default', ['less:development', 'replace', 'copy:development']);

};