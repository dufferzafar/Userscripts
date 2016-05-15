goreMbifa.controller('mbifaController', function ($scope, config, dataCollectorService) {
    var data = dataCollectorService.collectData();
    var documentLocationHref = document.location.href.split('?')[0]

    $scope.form = {
        'method': config.form.method,
        'action': config.form.action,
        'target': config.form.target,
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
        'method': config.link.method,
        'target': config.link.target
    };
});