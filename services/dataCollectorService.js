goreMbifa.service('dataCollectorService', function (config, siteLookupService, languageLookupService) {
    this.collectData = function () {
        var siteSpecificConfig = config.sites[siteLookupService].languages[languageLookupService]

        return {
            'title': jquery('#productTitle').text().trim(),
            'artist': jquery('.author a').html(),
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

            for (var i = 1; i < tracklistContent.length; i++) {
                if (tracklistContent[i].classList.contains('sampleTracksHeader')) {
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