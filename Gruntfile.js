//
//     hypeengine
//     Copyright (C) 2013 - 2017, Hüseyin Uslu, Int6ware - http://www.int6ware.com
//
'use strict';

module.exports = function (grunt) {
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell: {
      semistandard: 'semistandard src/**/*.js --verbose | snazzy',
      cover: 'npm run cover'
    },    
    mochaTest: {
      options: {
        reporter: 'mochawesome',
        reporterOptions: {
          reportDir: 'build/test/mocha/',
          reportName: 'result',
          inlineAssets: true
        },
        quiet: false
      },
      src: ['test/**/*.js']
    },
    eslint: {
      target: ['src/**/*.js', 'assets/js/**/*.js', 'test/**/*.js', 'contrib/**/*.js'],
      options: {
        configFile: '.eslintrc.yaml',
        ingorePath: '.eslintignore',
        format: 'html',
        outputFile: 'build/lint/eslint/result.html',
        maxWarnings: -1
      }
    }
  });

  // load all plugins.
  require('load-grunt-tasks')(grunt);

  // tasks.
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('cover', 'shell:cover');
  grunt.registerTask('semistandard', 'shell:semistandard');
  grunt.registerTask('default', ['test']);
};
