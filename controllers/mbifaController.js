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