// ==UserScript==
// @id             MusicBrainz-Import-from-Amazon
// @name           MusicBrainz: Import from Amazon
// @version        0.7
// @namespace      mb_import_from_amazon
// @author         dufferZafar
// @description    Import releases from Amazon
// @include        *://www.amazon.*
// @run-at         document-end
// ==/UserScript==

//**************************************************************************//

// console.log("MB-Import-From-Amazon UserScript");

// The script only runs on 'Music' pages
var nav = document.getElementById('nav-subnav');
var category = nav.getElementsByClassName('nav_a')[0].textContent;
if (category != "Music")
{
   return;
}

// Create a form which opens the add release form
var addForm = document.createElement("form");
addForm.method="post";
addForm.target = "blank";
addForm.action = document.location.protocol + "//musicbrainz.org/release/add";
addForm.acceptCharset = "UTF-8";

// Todo: Make the button feel like a part of Amazon
// var btnCSS = document.createElement("style");
// btnCSS.type = "text/css";
// btnCSS.innerHTML = ".mbbtn {background-color: #C0DBF2}";
// document.body.appendChild(btnCSS);

var addBtnElem = document.createElement("input");
addBtnElem.type = "submit";
addBtnElem.value = "Add release to MusicBrainz";
addBtnElem.classList.add("mbbtn");
addForm.appendChild(addBtnElem);

var div = document.createElement("div");

var artist = '', album = '', label = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

//////////////////////////////////////////////////////////////////////////////

// Script Begins

// Title of the Album
// Todo: Use regex to extract ONLY album title
add_field("name", document.getElementById('btAsinTitle').textContent);

// Album Artist (Composer)
// Todo: Loop over <a> tags to find ALL composers
var title = document.getElementsByClassName('parseasinTitle')[0];
var albumArtists = title.nextElementSibling.getElementsByTagName('a');
add_field("artist_credit.names.0.artist.name", albumArtists[0].textContent);

// Date and Label
var detailsTab = document.getElementById('productDetailsTable');
var detailsList = detailsTab.getElementsByTagName('li');

var reAudioCD = /Audio CD  \((.*)\)/;
var reDate = /Original Release Date: (.*)/;
var reLabel = /Label: (.*)/;

var reNumDiscs = /Number of Discs: (.*)/;
// var reFormat = /Format: (.*)/;

var match = null;

for (var i = 0; i < detailsList.length; ++i)
{
   // console.log(detailsList[i].textContent);

   match = reAudioCD.exec(detailsList[i].textContent);
   if (match)
   {
      // Todo: Parse (but the format can be anything?)
      // console.log("date", match[1]);
   }

   match = reDate.exec(detailsList[i].textContent);
   if (match)
   {
      add_field("date.year", match[1]);
   }

   match = reLabel.exec(detailsList[i].textContent);
   if (match)
   {
      add_field("labels.0.name", match[1]);
   }
}

// Tracklist - the real deal
var prodDesc = document.getElementById('productDescription');
var trackList = prodDesc.getElementsByClassName('productDescriptionWrapper')[0];
var tracks = trackList.getElementsByTagName('b');

// Note: Most Indian releases have just 1 disc...
var discNumber = 0;
add_field("mediums." + discNumber + ".format", "CD");

for (var i = 0; i < tracks.length; i++)
{
   // console.log(tracks[i].textContent, tracks[i].nextSibling.textContent);

   var reTrack = /(\d+)\.\s+(.*)\s+-\s+(.*)/;
   var reSingers = /Singers?:\s+(.*)/;
   var reLyricist = /Lyrics:\s+(.*)/;

   var trackDetails = reTrack.exec(tracks[i].textContent);
   var trackNumber = i;  // or trackDetails[1];
   var trackTitle = trackDetails[2];
   var trackLength = (trackDetails[3]).replace(/[\(\)]/g, "");

   // console.log(trackNumber, trackTitle, trackLength);
   // console.log(singers);

   add_field("mediums." + discNumber + ".track." + trackNumber + ".name", trackTitle);
   // console.log("mediums." + discNumber + ".track." + trackNumber + ".name", trackTitle);

   add_field("mediums." + discNumber + ".track." + trackNumber + ".length", trackLength);
   // console.log("mediums." + discNumber + ".track." + trackNumber + ".length", trackLength);

   var t = tracks[i].nextSibling;
   if (t.tagName.toLowerCase() == 'i')
   {
      var singers = reSingers.exec(t.textContent)[1].split(/[,&]/);

      // Loop over all singers, and add them as separate artists
      for (var j = 0; j < singers.length; j++)
      {
         add_field("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".name", singers[j].trim());
         // console.log("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".name", singers[j].trim());

         if (j != singers.length - 1)
            add_field("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".join_phrase", " & ");
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
// add_field("script", "Jpan");

add_field("edit_note", "Release added using the MB-Import-From-Amazon userscript from page: " + document.location.href);

add_field("urls.0.url", document.location.href);
add_field("urls.0.link_type", "74");

//////////////////////////////////////////////////////////////////////////////

// Append our button to the body
div.appendChild(addForm);
var parent = document.getElementsByClassName('buyingDetailsGrid')[0];
parent.insertBefore(div, parent.firstChild);

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
   var field = document.createElement("input");
   field.type = "hidden";
   field.name = name;
   field.value = value;
   addForm.appendChild(field);
}
