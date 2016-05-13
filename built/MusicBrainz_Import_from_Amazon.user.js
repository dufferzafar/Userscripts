// ==UserScript==
// @name        MusicBrainz: Import from Amazon
// @namespace   https://github.com/Goram/Userscripts
// @include     *://www.amazon.*
// @version     0.98.3
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

if (jquery('#rightCol').length) {
    jquery('#rightCol').prepend(
        '<data-gore-mbifa-bootstrap data-ng-app="goreMbifa" data-ng-controller="mbifaController">'
    );
} else if (jquery('.buyingDetailsGrid').length) {
    jquery('.buyingDetailsGrid').prepend(
        '<tr><td><data-gore-mbifa-bootstrap data-ng-app="goreMbifa" data-ng-controller="mbifaController"></td></tr>'
    );
}

var goreMbifa = angular.module('goreMbifa', []);

goreMbifa.constant('config', {
    'sites': {
        'www.amazon.de': {
            'languages': {
                'de': {
                    'months': { 'Januar': '1', 'Februar': '2', 'März': '3', 'April': '4', 'Mai': '5', 'Juni': '6', 'Juli': '7', 'August': '8', 'September': '9', 'Oktober': '10', 'November': '11', 'Dezember': '12' },
                    'disc': 'Disk',
                    'releaseDateOrder': [0, 1, 2],
                    'regexNumDiscs': /Anzahl Disks\/Tonträger: (.*)/,
                    'regexReleaseLabel': /Label: (.*)/
                }
            }
        },
        'www.amazon.com': {
            'languages': {
                'en': {
                    'months': { 'January': '1', 'February': '2', 'March': '3', 'April': '4', 'May': '5', 'June': '6', 'July': '7', 'August': '8', 'September': '9', 'October': '10', 'November': '11', 'December': '12' },
                    'disc': 'Disc',
                    'releaseDateOrder': [1, 0, 2],
                    'regexNumDiscs': /Number of Discs: (.*)/,
                    'regexReleaseLabel': /Label: (.*)/
                }
            }
        },
        'www.amazon.co.uk': {
            'languages': {
                'en': {
                    'months': { 'Jan.': '1', 'Feb.': '2', 'March': '3', 'April': '4', 'May': '5', 'June': '6', 'July': '7', 'Aug.': '8', 'Sept.': '9', 'Oct.': '10', 'Nov.': '11', 'Dec': '12' },
                    'disc': 'Disc',
                    'releaseDateOrder': [0, 1, 2],
                    'regexNumDiscs': /Number of Discs: (.*)/,
                    'regexReleaseLabel': /Label: (.*)/
                }
            }
        },
        'www.amazon.ca': {
            'languages': {
                'en': {
                    'months': { 'Jan': '1', 'Feb': '2', 'March': '3', 'April': '4', 'May': '5', 'June': '6', 'July': '7', 'Aug': '8', 'Sept': '9', 'Oct': '10', 'Nov': '11', 'Dec': '12' },
                    'disc': 'Disc',
                    'releaseDateOrder': [1, 0, 2],
                    'regexNumDiscs': /Number of Discs: (.*)/,
                    'regexReleaseLabel': /Label: (.*)/
                },
                'fr': {
                    'months': { 'janvier': '1', 'février': '2', 'mars': '3', 'avril': '4', 'mai': '5', 'juin': '6', 'juillet': '7', 'août': '8', 'septembre': '9', 'octobre': '10', 'novembre': '11', 'décembre': '12' },
                    'disc': 'Disc',
                    'releaseDateOrder': [0, 1, 2],
                    'regexNumDiscs': /Quantité de disques : (.*)/,
                    'regexReleaseLabel': /Étiquette : (.*)/
                }
            }
        }
    },
    'form': {
        'method': 'post',
        'target': '_blank',
        'action': 'https://musicbrainz.org/release/add',
        'acceptCharset': 'UTF-8',
        'primaryType': {
            'name': 'type',
            'types': [
                {'key': '', 'value': 'Primary Type'},
                {'key': 'Album', 'value': 'Album'},
                {'key': 'Single', 'value': 'Single'},
                {'key': 'EP', 'value': 'EP'},
                {'key': 'Broadcast', 'value': 'Broadcast'},
                {'key': 'Other', 'value': 'Other'}
            ]
        },
        'editNode': 'Release added using the MB-Import-From-Amazon userscript from page: '
    },
    'regexReleaseDate': /Audio CD  \((.*)\)/
});

goreMbifa.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'https://musicbrainz.org/**'
    ]);
});

goreMbifa.directive('goreMbifaBootstrap', function () {
    return {
        template:
           `<style>
                #gorembifa-app {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 14px 18px;
                    margin: 0px 0px 12px 0px;
                }

                #gorembifa-app select {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 3px;
                }

                #gorembifa-app form {
                    width: 100%;
                    display: block;
                    margin-bottom: 0px;
                }

                #gorembifa-app input[type="submit"] {
                    width: 100%;
                    height: 24px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);
                    margin: 10px 0px 0px 0px;
                    font-family: Arial, sans-serif;
                }
            </style>
            <div id="gorembifa-app">
                <form method="{{ method }}" target="{{ target }}" action="{{ action }}" accept-charset="{{ acceptCharset }}">
                    <select name="{{ primaryType.name }}" data-ng-model="primaryType.selectedType" data-ng-options="type.value for type in primaryType.types track by type.key"/>
                    <input type="hidden" name="name" value="{{ title }}"/>
                    <input type="hidden" name="artist_credit.names.0.name" value="{{ artist }}"/>
                    <input type="hidden" name="status" value="{{ status }}"/>
                    <input type="hidden" name="events.0.date.day" value="{{ releaseDate[0] }}"/>
                    <input type="hidden" name="events.0.date.month" value="{{ releaseDate[1] }}"/>
                    <input type="hidden" name="events.0.date.year" value="{{ releaseDate[2] }}"/>
                    <input type="hidden" name="labels.0.name" value="{{ label }}"/>
                    <input type="hidden" name="urls.0.link_type" value="{{ externalLinkType }}"/>
                    <input type="hidden" name="urls.0.url" value="{{ asin }}"/>
                    <discs data-ng-repeat="disc in tracklist.discs track by $index">
                        <input type="hidden" name="mediums.{{ $index }}.format" value="CD"/>
                        <tracks data-ng-repeat="track in disc.tracks" track by $index>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.number" value="{{ track.number }}"/>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.name" value="{{ track.title }}"/>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.length" value="{{ track.length }}"/>
                        </tracks>
                    </discs>
                    <input type="hidden" name="edit_note" value="{{ editNote }}"/>
                    <input type="submit" value="Export to MusicBrainz"/>
                </form>
            </div>`
    };
});

goreMbifa.controller('mbifaController', function ($scope, config, dataCollectorService) {
    $scope.method = config.form.method;
    $scope.action = config.form.action;
    $scope.target = config.form.target;
    $scope.acceptCharset = config.form.acceptCharset;

    $scope.primaryType = {
        'name': config.form.primaryType.name,
        'types': config.form.primaryType.types,
        'selectedType': config.form.primaryType.types[0]
    }

    var data = dataCollectorService.collectData();

    $scope.title = data['title'];
    $scope.artist = data['artist'];
    $scope.status = 'official';
    $scope.releaseDate = data['releaseDate'];
    $scope.label = data['label'];

    var documentLocationHref = document.location.href.split('?')[0]

    $scope.externalLinkType = '77'
    $scope.asin = documentLocationHref;

    $scope.tracklist = data['tracklist'];

    $scope.editNote = config.form.editNode + documentLocationHref;
});

goreMbifa.service('dataCollectorService', function (config, siteLookupService, languageLookupService) {
    this.collectData = function () {
        var siteSpecificConfig = config.sites[siteLookupService].languages[languageLookupService]

        var title = '';

        if (jquery('#productTitle').length) {
            title = jquery('#productTitle').text().trim();
        } else if (jquery('.buying').length) {
            title = jquery('#btAsinTitle span').clone().find('span').remove().end().html().trim();
        }

        var artist = '';

        if (jquery('.author a').length) {
            artist = jquery('.author a').text().trim();
        } else if (jquery('.buying').length) {
            artist = jquery('.buying span a').html().trim()
        }

        return {
            'title': title,
            'artist': artist,
            'releaseDate': this.collectReleaseDate(siteSpecificConfig, config.regexReleaseDate),
            'label': this.collectLabel(siteSpecificConfig),
            'tracklist': this.collectTracklist(siteSpecificConfig)
        };
    };

    this.collectReleaseDate = function (siteSpecificConfig, regexReleaseDate) {
        var releaseDate = [];

        var releaseDateElement = jquery('#productDetailsTable li').filter(function () {
            return regexReleaseDate.test(jquery(this).text());
        });

        var releaseDateMatch = regexReleaseDate.exec(releaseDateElement.text());

        if (releaseDateMatch) {
            var releaseDateParts = releaseDateMatch[1].replace(/[.,]/g, '').split(' ');

            for (var i = 0; i < siteSpecificConfig.releaseDateOrder.length; i++) {
                if (i == 1) {
                    releaseDate.push(siteSpecificConfig.months[releaseDateParts[siteSpecificConfig.releaseDateOrder[i]]]);
                    continue;
                }

                releaseDate.push(releaseDateParts[siteSpecificConfig.releaseDateOrder[i]]);
            }
        }

        return releaseDate;
    }

    this.collectLabel = function (siteSpecificConfig) {
        var label = '';

        var labelElement = jquery('#productDetailsTable li').filter(function () {
            return siteSpecificConfig.regexReleaseLabel.test(jquery(this).text());
        });

        var labelMatch = siteSpecificConfig.regexReleaseLabel.exec(labelElement.text());

        if (labelMatch) {
            label = labelMatch[1];
        }

        return label;
    }

    this.collectTracklist = function (siteSpecificConfig) {
        var tracklist = { 'discs': [] };
        var disc = 0;
        var tracks = { 'tracks': [] };

        // Amazon has more than one tracklist...
        if (jquery('#dmusic_tracklist_content').length) {
            /*
                Tracklists:
                One Disk: http://www.amazon.de/01-Fl%C3%BCsterer-Remastered-Gabriel-Burns/dp/B00N29D69I
                Multiple Disks: http://www.amazon.de/Book-Souls-limited-Deluxe/dp/B00ZVFYVMM
            */
            var tracklistContent = jquery('#dmusic_tracklist_content tr');

            for (var i = 1; i < tracklistContent.length; i++) {
                if (tracklistContent[i].id == 'dmusic_tracklist_player_disc_' + (disc + 2)) {
                    tracklist['discs'][disc] = tracks;

                    disc++;
                    var tracks = { 'tracks': [] };

                    continue;
                }

                var trackDetails = tracklistContent[i].getElementsByTagName('td');

                if (trackDetails[0].getElementsByClassName('TrackNumber')[0]) {
                    tracks['tracks'].push({
                        'number': trackDetails[0].getElementsByClassName('TrackNumber')[0].textContent.trim(),
                        'title': trackDetails[1].getElementsByClassName('TitleLink')[0].textContent.trim(),
                        'length': trackDetails[2].getElementsByTagName("span")[0].textContent.trim()
                    });
                }
            }
        } else if (jquery('#dmusic_tracklist_player').length) {
            /*
                Tracklists:
                One Disk: http://www.amazon.de/Seventh-Son-Iron-Maiden/dp/B0000251W3
                Multiple Disks: http://www.amazon.de/Deceiver-Gods-Amon-Amarth/dp/B00CEJ2H6K
            */
            var tracklistContent = jquery('#dmusic_tracklist_player .a-row');

            for (var i = 1; i < tracklistContent.length; i++) {
                if (tracklistContent[i].textContent.trim() == siteSpecificConfig.disc + ": " + (disc + 2)) {
                    tracklist['discs'][disc] = tracks;

                    disc++;
                    var tracks = { 'tracks': [] };

                    continue;
                }

                var trackDetails = tracklistContent[i].textContent.split('. ');

                tracks['tracks'].push({
                    'number': trackDetails[0].trim(),
                    'title': trackDetails[1].trim()
                });
            }
        } else if (jquery('#musicTracksFeature').length) {
            /*
                Tracklists:
                One Disk: http://www.amazon.ca/gp/product/B00062PWOQ
                Multiple Disks: http://www.amazon.ca/The-Book-Souls-Deluxe-Hardcover/dp/B00ZVFYVMM
            */

            var tracklistContent = jquery('#musicTracksFeature tr');

            for (var i = 0; i < tracklistContent.length; i++) {
                if (tracklistContent[i].classList.contains('sampleTracksHeader')) {
                    if (i == 0) {
                        continue;
                    }

                    tracklist['discs'][disc] = tracks;

                    disc++;
                    var tracks = { 'tracks': [] };

                    continue;
                }

                if (tracklistContent[i].hasAttribute('class')) {
                    var trackDetails = tracklistContent[i].getElementsByTagName('td')[0].textContent.split('. ');

                    tracks['tracks'].push({
                        'number': trackDetails[0].trim(),
                        'title': trackDetails[1].trim()
                    });
                }
            }
        }

        tracklist['discs'][disc] = tracks;

        return tracklist;
    }
});

goreMbifa.factory('languageLookupService', function () {
    var navLocale = jquery('header').attr('class').split(' ')[1];

    return navLocale.substring(9, 11);
});

goreMbifa.value('siteLookupService', document.domain);