// ==UserScript==
// @id             MusicBrainz-Import-from-TSeries
// @name           MusicBrainz: Import from TSeries
// @version        0.1
// @namespace      mb_import_from_tseries
// @author         dufferZafar
// @description    Import albums from T-Series official website to add them as a release to Musicbrainz
// @include        *://www.tseries.com/music/*
// @run-at         document-end
// ==/UserScript==

// Create a form which opens the add release form
var addForm = document.createElement("form");
addForm.method="post";
addForm.target = "blank";
addForm.action = document.location.protocol + "//musicbrainz.org/release/add";
addForm.acceptCharset = "UTF-8";

// Todo: Make the button feel like a part of Amazon
var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
btnCSS.innerHTML = ".mbBtn {margin-bottom: 10px; height: 35px; border: none; cursor: pointer;}";
document.body.appendChild(btnCSS);

var addBtnElem = document.createElement("input");
addBtnElem.type = "submit";
addBtnElem.value = "Add release to MusicBrainz";
addBtnElem.classList.add("redBtn");
addBtnElem.classList.add("mbBtn");
addForm.appendChild(addBtnElem);

var div = document.createElement("div");

var artist = '', album = '', label = 'T-Series', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

//////////////////////////////////////////////////////////////////////////////

// Script Begins

var details = document.getElementsByClassName('movieDetail')[0];

// Title of the Album
console.log('name', details.getElementsByTagName('h3').textContent);
add_field("name", details.getElementsByTagName('h3').textContent);

// Album Artist (Composer)
var albumArtists = details.getElementsByClassName('field-name-field-album-musicdirector');
console.log('artist_credit.names.0.artist.name', albumArtists[0].textContent);
add_field("artist_credit.names.0.artist.name", albumArtists[0].textContent);

// It has no Date data, sadly





//////////////////////////////////////////////////////////////////////////////

// Append our button to the body
div.appendChild(addForm);
var parent = document.getElementsByClassName('sysnav')[0];
parent.insertBefore(div, parent.firstChild);

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
   var field = document.createElement("input");
   field.type = "hidden";
   field.name = name;
   field.value = value;
   addForm.appendChild(field);
}
