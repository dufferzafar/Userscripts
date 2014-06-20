// ==UserScript==
// @id             MusicBrainz-Import-from-TSeries
// @name           MusicBrainz: Import from TSeries
// @version        0.7
// @namespace      mb_import_from_tseries
// @author         dufferZafar
// @description    Import albums from the T-Series official website to add them as a release to Musicbrainz
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

var artist = '', album = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

//////////////////////////////////////////////////////////////////////////////

// Script Begins

// Title of the Album
var details = document.getElementsByClassName('movieDetail')[0];
console.log('name', details.getElementsByTagName('h3')[0].textContent);
add_field("name", details.getElementsByTagName('h3')[0].textContent);

// Album Artist (Composer)
var albumArtists = details.getElementsByClassName('field-name-field-album-musicdirector');
console.log('artist_credit.names.0.artist.name', albumArtists[0].textContent);
add_field("artist_credit.names.0.artist.name", albumArtists[0].textContent);

// It has no Date data, sadly

// We knew this already
add_field("labels.0.name", "T-Series");

// Tracklist - the real deal
var tracks = document.getElementsByClassName('songtitle');

// Note: Most Indian releases have just 1 disc...
var discNumber = 0;
add_field("mediums." + discNumber + ".format", "CD");

for (var i = 0; i < tracks.length; i++)
{
   if (tracks[i].tagName.toLowerCase() == 'td')
   {
      var trackTitle = tracks[i].textContent.trim();
      var trackNumber = i-1;

      add_field("mediums." + discNumber + ".track." + trackNumber + ".name", trackTitle);
      // console.log("mediums." + discNumber + ".track." + trackNumber + ".name", trackTitle);

      // add_field("mediums." + discNumber + ".track." + trackNumber + ".length", trackLength);
      // console.log("mediums." + discNumber + ".track." + trackNumber + ".length", trackLength);

      var t = tracks[i].nextElementSibling;
      if (t.tagName.toLowerCase() == 'td')
      {
         var artists = t.textContent.trim().split(/[,&]/);

         // console.log(t.textContent.trim());

         for (var j = 0; j < artists.length; j++)
         {
            add_field("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".name", artists[j].trim());
            // console.log("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".name", artists[j].trim());

            var join_phrase = (j != artists.length - 1) ? (j == artists.length - 2) ? " & " : ", " : "";

            if (j != artists.length - 1)
               add_field("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".join_phrase", join_phrase);
         }

      }
   }
}

// Miscellaneous Details
add_field("type", "Album");
add_field("type", "Soundtrack");
add_field("status", "official");
add_field("packaging", 'None');

add_field("language", "hin");
add_field("country", "IN");
// add_field("script", "");

add_field("edit_note", "Release added using the MB-Import-From-TSeries userscript from page: " + document.location.href + " Sadly, the T-Series website does not contain track lengths.");

add_field("urls.0.url", document.location.href);
add_field("urls.0.link_type", "74");

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
