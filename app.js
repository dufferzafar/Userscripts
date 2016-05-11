var jquery = {};

jquery = jQuery.noConflict(true);

jquery('#rightCol').prepend(
    '<data-gore-mbifa-bootstrap data-ng-app="goreMbifa" data-ng-controller="mbifaController">'
);

var goreMbifa = angular.module('goreMbifa', []);