// ==UserScript==
// @id             MusicBrainz-Import-from-Amazon
// @name           MusicBrainz: Import from Amazon
// @version        0.3
// @namespace      mb_import_from_amazon
// @author         dufferZafar
// @description    Import releases from Amazon
// @include        *://www.amazon.*
// @run-at         document-end
// ==/UserScript==

//**************************************************************************//

// The script only runs on 'Music' pages
var nav = document.getElementById('nav-subnav');
var category = nav.getElementsByClassName('nav_a')[0].textContent;
if (category != "Music")
{
   return
}

// Create a form which opens the add release form
var myform = document.createElement("form");
myform.method="post";
myform.action = document.location.protocol + "//musicbrainz.org/release/add";
myform.acceptCharset = "UTF-8";

// Todo: Make the button feel like a part of Amazon
mysubmit = document.createElement("input");
mysubmit.type = "submit";
mysubmit.value = "Add release to MusicBrainz";
myform.appendChild(mysubmit);

var div = document.createElement("div");
// div.classList.add("btn-medium");
// div.classList.add("txtsmall");

var artist = '', album = '', label = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

//////////////////////////////////////////////////////////////////////////////

// Script Begins

// Title of the Album
// Todo: Use regex to extract ONLY album title
console.log('album', document.getElementById('btAsinTitle').textContent);

// Album Artist (Composer)
// Todo: Loop over <a> tags to find ALL composers
var title = document.getElementsByClassName('parseasinTitle')[0];
var albumArtists = title.nextElementSibling.getElementsByTagName('a')
console.log('artist_credit.names.0.artist.name', albumArtists[0].textContent);

// Packaging
console.log("packaging", 'None');

// Misclleaneous Details
var detailsTab = document.getElementById('productDetailsTable');
var detailsList = detailsTab.getElementsByTagName('li');

var reAudioCD = /Audio CD  \((.*)\)/;
var reDate = /Original Release Date: (.*)/;
var reLabel = /Label: (.*)/;

// var reNumDiscs = /Number of Discs: (.*)/;
// var reFormat = /Format: (.*)/;
var match = null;

for (var i = 0; i < detailsList.length; ++i)
{
   // console.log(detailsList[i].textContent);

   match = reAudioCD.exec(detailsList[i].textContent);
   if (match)
   {
      // Parse the date
      console.log("date", match[1]);
      // console.log("date.year", year);
      // console.log("date.month", month);
      // console.log("date.day", day);
   }

   match = reDate.exec(detailsList[i].textContent);
   if (match)
   {
      console.log("date.year", match[1]);
   }

   match = reLabel.exec(detailsList[i].textContent);
   if (match)
   {
      console.log("label", match[1]);
   }
}

// Tracklist - the real deal

var prodDesc = document.getElementById('productDescription');
if (prodDesc)
{
   var trackList = prodDesc.getElementsByClassName('productDescriptionWrapper')[0];
   var tracks = trackList.getElementsByTagName('b');

   for (var i = 0; i < tracks.length; i++)
   {
      // Todo: Regex to parse title of the track, its duration, and artists
      // console.log(tracks[i].textContent, tracks[i].nextSibling.textContent);
   }
};

//////////////////////////////////////////////////////////////////////////////

// Append our button to the body
div.appendChild(myform);
var parent = document.getElementsByClassName('buyingDetailsGrid')[0];
parent.insertBefore(div, parent.firstChild);

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
   var field = document.createElement("input");
   field.type = "hidden";
   field.name = name;
   field.value = value;
   myform.appendChild(field);
}
