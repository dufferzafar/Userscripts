/// <binding ProjectOpened='watch:javascript' />

module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            javascript: {
                files: ['application/**/*.js'],
                tasks: ['concat'],
                options: {
                    event: ['all'],
                }
            }
        },
        concat: {
            options: {
                banner: "// ==UserScript==\n"
                      + "// @name        MusicBrainz: Import from Amazon\n"
                      + "// @namespace   https://github.com/Goram/MusicBrainz-Import-from-Amazon\n"
                      + "// @include     *://www.amazon.*\n" 
                      + "// @version     0.98.5\n"
                      + "// @grant       none\n"
                      + "// @author      Gore (based on https://github.com/dufferzafar/Userscripts)\n"
                      + "// @description Import releases from Amazon\n"
                      + "// @require     https://code.jquery.com/jquery-2.2.3.min.js\n"
                      + "// @require     https://code.jquery.com/ui/1.11.4/jquery-ui.min.js\n"
                      + "// @require     https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js\n"
                      + "// @run-at      document-end\n"
                      + "// ==/UserScript==\n\n"
                      + "'use strict';\n\n",
                separator: '\n\n'
            },
            javascript: {
                src: [
                    'application/app.js',
                    'application/config.js',
                    'application/directives/bootstrapDirective.js',
                    'application/controllers/mbifaController.js', 
                    'application/services/dataCollectorService.js',
                    'application/services/languageLookupService.js',
                    'application/services/siteLookUpService.js'
                ],
                dest: 'built/MusicBrainz_Import_from_Amazon.user.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
};