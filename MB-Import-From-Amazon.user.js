// ==UserScript==
// @id             MusicBrainz-Import-from-Amazon
// @name           MusicBrainz: Import from Amazon
// @version        0.8
// @namespace      mb_import_from_amazon
// @author         dufferZafar & Gore
// @description    Import releases from Amazon
// @include        *://www.amazon.*
// @run-at         document-end
// ==/UserScript==

//**************************************************************************//

// Configuration
var navigationItem = document.getElementById('nav-subnav').getElementsByClassName('nav-a')[0].textContent;
var domain = "";
var category = "";
var months;
var monthsDe = {"Januar": 1, "Februar": 2, "Juli": 7};
var monthsCom = {"January": 1, "Juli": 7};
var regexAudioCD = /Audio CD  \((.*)\)/;
var regexLabel = /Label: (.*)/;

switch (navigationItem)
{
    // amazon.com
    case "CDs & Vinyl":
        domain = 'com';
        category = "cd";
        var regexNumDiscs = /Number of Discs: (.*)/;
        break;

    case "Digital Music":
        domain = 'com';
        category = "mp3";
        break;

    // amazon.de
    case "Musik-CDs & Vinyl":
        months = monthsDe;
        domain = 'de';
        category = "cd";
        var regexNumDiscs = /Anzahl Disks\/Tonträger: (.*)/;
        break;

    case "Musik-Downloads":
        domain = 'de';
        category = "mp3";
        break;

    default:
        return;
}

// Create a form which opens the add release form
var addForm = document.createElement("form");
addForm.method="post";
addForm.target = "_blank";
addForm.action = "https://musicbrainz.org/release/add";
addForm.acceptCharset = "UTF-8";

var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
btnCSS.innerHTML = ".mbBtn {border: 1px solid #6DAEE1; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-bottom: -10x; width: 100%; background: #C9E1F4;} .mbBtn:hover {background: #B2D3ED}"
document.body.appendChild(btnCSS);

var addBtnElem = document.createElement("input");
addBtnElem.type = "submit";
addBtnElem.value = "Add release to MusicBrainz";
addBtnElem.classList.add("mbBtn");
addForm.appendChild(addBtnElem);

var div = document.createElement("div");

var artist = '';
var album = '';
var label = '';
var year = 0;
var month = 0;
var day = 0;
var country = '';
var type = 'album';
var discs = 0;

//////////////////////////////////////////////////////////////////////////////

switch (category)
{
    case "cd":
        // Title of the Album
        // Todo: Use regex to extract ONLY album title
        add_field("name", document.getElementById('productTitle').textContent);

        // Album Artist (Composer)
        // Todo: Loop over <a> tags to find ALL composers
        var albumArtists = document.getElementsByClassName('author');
        var albumArtist = albumArtists[0].getElementsByTagName('a');
        add_field("artist_credit.names.0.artist.name", albumArtist[0].textContent);

        // Date and Label
        var detailsTab = document.getElementById('productDetailsTable');
        var detailsList = detailsTab.getElementsByTagName('li');
    

        // var reFormat = /Format: (.*)/;

        var match = null;

        for (var i = 0; i < detailsList.length; ++i)
        {
            console.log(detailsList[i].textContent);
            
            match = regexAudioCD.exec(detailsList[i].textContent);

            if (match)
            {
                switch (domain)
                {
                    case "de":
                        var splittedDate = match[1].split(" ");
                       
                        add_field("events.0.date.day", splittedDate[0].substr(0, 2));
                        add_field("events.0.date.month", months[splittedDate[1]]);
                        add_field("events.0.date.year", splittedDate[2]);
                        break;

                    case "com":
                        var splittedDate = match[1].split(" ");
                       
                        add_field("events.0.date.day", splittedDate[1].substr(0, 2));
                        add_field("events.0.date.month", months[splittedDate[0]]);
                        add_field("events.0.date.year", splittedDate[2]);
                }
            }

            match = regexLabel.exec(detailsList[i].textContent);

            if (match)
            {
                add_field("labels.0.name", match[1]);
            }

            match = regexLabel.exec(detailsList[i].textContent);

            if (match)
            {
                add_field("labels.0.name", match[1]);
            }
        }
        break;
}


/*
// Tracklist - the real deal
var prodDesc = document.getElementById('productDescription');
var trackList = prodDesc.getElementsByClassName('productDescriptionWrapper')[0];
var tracks = trackList.getElementsByTagName('b');
alert("666");
// Note: Most Indian releases have just 1 disc...
var discNumber = 0;
add_field("mediums." + discNumber + ".format", "CD");

// Some Regexes
var reTrack = /(\d+)\.\s+(.*)\s+-\s+(.*)/;
var reSingers = /Singers?:\s+(.*)/;
var reLyricist = /Lyrics:\s+(.*)/;

for (var i = 0; i < tracks.length; i++)
{
   // console.log(tracks[i].textContent, tracks[i].nextSibling.textContent);

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

         var join_phrase = (j != singers.length - 1) ? (j == singers.length - 2) ? " & " : ", " : "";

         if (j != singers.length - 1)
            add_field("mediums." + discNumber + ".track." + trackNumber + ".artist_credit.names." + j + ".join_phrase", join_phrase);
      }
   }
}
*/

// Miscellaneous Details
//add_field("type", "Album");
//add_field("type", "Soundtrack");
add_field("status", "official");
//add_field("packaging", 'None');

//add_field("language", "hin");
//add_field("country", "IN");
// add_field("script", "Jpan");

add_field("edit_note", "Release added using the MB-Import-From-Amazon userscript from page: " + document.location.href);

add_field("urls.0.url", document.location.href);
add_field("urls.0.link_type", "77");

//////////////////////////////////////////////////////////////////////////////

// Append our button to the body
div.appendChild(addForm);

if (document.getElementById('tellAFriendBox_feature_div'))
{   

    document.getElementById('tellAFriendBox_feature_div').appendChild(div);
}


//////////////////////////////////////////////////////////////////////////////

function add_field(name, value) 
{
    var field = document.createElement("input");

    field.type = "hidden";
    field.name = name;
    field.value = value;

    addForm.appendChild(field);
}
