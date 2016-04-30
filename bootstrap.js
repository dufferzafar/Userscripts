var div = document.createElement('div');
div.setAttribute('data-ng-app', 'mbImportFromAmazon')
div.setAttribute('data-ng-view', 'data-ng-view');

var p = document.createElement('p');
p.setAttribute('data-ng-controller', 'import')
p.innerHTML = '{{ form }}'

div.appendChild(p);
document.getElementById('navbar').appendChild(div)

var goreMbifa = angular.module('goreMbifa');