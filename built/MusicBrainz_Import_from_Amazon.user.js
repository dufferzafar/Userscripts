// ==UserScript==
// @name        MusicBrainz: Import from Amazon
// @namespace   https://github.com/Goram/Userscripts
// @include     *://www.amazon.*
// @version     0.97
// @grant       none
// @author      Gore (based on https://github.com/dufferzafar/Userscripts)
// @description Import releases from Amazon
// @require     https://code.jquery.com/jquery-2.2.3.min.js
// @require     https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js
// @run-at      document-end
// ==/UserScript==

'use strict';

var jquery = {};

jquery = jQuery.noConflict(true);

jquery('#navbar').append(
	'<div data-ng-app="goreMbifa" data-ng-controller="mbifaController"><div id="form"></div></div>'
);

var goreMbifa = angular.module('goreMbifa', []);

goreMbifa.value('navItem', jquery('span.nav-a-content').html());