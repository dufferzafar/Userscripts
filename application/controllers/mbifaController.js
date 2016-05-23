goreMbifa.controller('mbifaController', function ($scope, $http, config, dataCollectorService) {
    var data = dataCollectorService.collectData();
    var documentLocationHref = document.location.href.split('?')[0]

    $scope.form = {
        'method': config.form.method,
        'action': config.form.action,
        'acceptCharset': config.form.acceptCharset,
        'primaryType': {
            'name': config.form.primaryType.name,
            'types': config.form.primaryType.types,
            'selectedType': config.form.primaryType.types[0]
        },
        'title': data['title'],
        'artist': data['artist'],
        'status': 'official',
        'releaseDate': data['releaseDate'],
        'label': data['label'],
        'externalLinkType': '77',
        'asin': documentLocationHref,
        'tracklist': data['tracklist'],
        'editNote': config.form.editNode + documentLocationHref
    };

    $scope.link = {
        'href': config.link.href,
        'query': encodeURIComponent(data['title']),
        'type': config.link.type,
        'limit': config.link.limit,
        'method': config.link.method
    };

    $scope.searchIndexed = {
        'releases':{},
        'error': false
    }

    $http({
        method: 'GET',
        url: 'https://musicbrainz.org/ws/2/release?query=' + encodeURIComponent(data['title']) + '&fmt=json'
    }).then(
    function (response) {
        $scope.searchIndexed.releases = response.data.releases;
    },
    function (response) {
        $scope.searchIndexed.error = true;
    });

    jquery('#search-indexed').accordion({
        heightStyle: 'content',
        active: false,
        collapsible: true
    });
});