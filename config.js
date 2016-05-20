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
        },
        'www.amazon.fr': {
            'languages': {
                'fr': {
                    'months': { 'janvier': '1', 'février': '2', 'mars': '3', 'avril': '4', 'mai': '5', 'juin': '6', 'juillet': '7', 'août': '8', 'septembre': '9', 'octobre': '10', 'novembre': '11', 'décembre': '12' },
                    'disc': 'Disc',
                    'releaseDateOrder': [0, 1, 2],
                    'regexNumDiscs': /Nombre de disques: (.*)/,
                    'regexReleaseLabel': /Label: (.*)/
                }
            }
        }
    },
    'form': {
        'method': 'post',
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
    'link': {
        'href': 'https://musicbrainz.org/search',
        'type': 'release',
        'limit': '25',
        'method': 'direct'
    },
    'regexReleaseDate': /Audio CD  \((.*)\)/
});

goreMbifa.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'https://musicbrainz.org/**'
    ]);
});
