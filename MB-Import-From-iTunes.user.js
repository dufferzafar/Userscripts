// ==UserScript==
// @name        MusicBrainz: Import from iTunes
// @description Import releases from iTunes
// @version     2014-02-22
// @author      -
// @namespace   http://userscripts.org/users/41307
//
// @include     *://itunes.apple.com/*
//
// ==/UserScript==
//**************************************************************************//

var myform = document.createElement("form");
myform.method="post";
myform.action = document.location.protocol + "//musicbrainz.org/release/add";
myform.acceptCharset = "UTF-8";
mysubmit = document.createElement("input");
mysubmit.type = "submit";
mysubmit.value = "Add to MusicBrainz";
myform.appendChild(mysubmit);

var div = document.createElement("div");
div.style.position = 'absolute';
div.style.top = 0;
div.style.right = 0;
div.style.padding = '10px';

var artist = '', album = '', label = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

if (m = /^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/.exec(document.location.href)) {
   country = m[1];

   var url = document.location.protocol + "//itunes.apple.com/lookup?id=" + m[2] + "&entity=song";
   if (m[1]) url = url + "&country=" + m[1];
   var xmlhttp = new XMLHttpRequest();
   xmlhttp.open('GET', url, true);
   xmlhttp.onreadystatechange = function() { callbackFunction(xmlhttp); }
   xmlhttp.send(null);
}

function callbackFunction(req) {
   if (xmlhttp.readyState != 4)
      return;
   var r = eval('(' + xmlhttp.responseText + ')');
// var r = $.parseJSON(xmlhttp.responseText);

   for (var i = 0; i < r.results.length; i++) {
      if (r.results[i].wrapperType == "collection") {
         artist = r.results[i].artistName;

         album = r.results[i].collectionName;
         if (m = /(.*?) - (Single|EP)/.exec(r.results[i].collectionName)) {
            album = m[1];
            type = m[2];
         }

         if (m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(r.results[i].releaseDate)) {
            year = m[1];
            month = m[2];
            day = m[3];
         }

         label = r.results[i].copyright;
         if (m = /(?:[0-9]{4} )?(.*)/.exec(r.results[i].copyright)) {
            label = m[1];
         }

      } else if (r.results[i].wrapperType == "track") {
         var discno = r.results[i].discNumber - 1;
         var trackno = r.results[i].trackNumber - 1;
         discs = r.results[i].discCount;

         var trackname = r.results[i].trackName;
         if (r.results[i].trackCensoredName && trackname != r.results[i].trackCensoredName) {
            var str1 = r.results[i].trackCensoredName.substr(0, trackname.length);
            var str2 = r.results[i].trackCensoredName.substr(trackname.length);
            if (trackname == str1 && str2.match(/^ \(.*\)$/)) {
               trackname = r.results[i].trackCensoredName;
            }
         }

         add_field("mediums." + discno + ".track." + trackno + ".name", trackname);
         add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names.0.name", r.results[i].artistName);
         add_field("mediums." + discno + ".track." + trackno + ".length", r.results[i].trackTimeMillis);
      }
   }

   for (var i = 0; i < discs; i++) {
      add_field("mediums." + i + ".format", 'Digital Media');
   }

   add_field("name", album);
   add_field("artist_credit.names.0.artist.name", artist);
   add_field("packaging", 'None');
   add_field("date.year", year);
   add_field("date.month", month);
   add_field("date.day", day);
   add_field("labels.0.name", label);
   add_field("country", country);
   add_field("status", "official");
   //add_field("language", "jpn");
   //add_field("script", "Jpan");
   add_field("type", type);
   add_field("edit_note", document.location.href);
   add_field("urls.0.link_type", "74");
   add_field("urls.0.url", document.location.href);

   div.appendChild(myform);
   document.body.appendChild(div);
}

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
   var field = document.createElement("input");
   field.type = "hidden";
   field.name = name;
   field.value = value;
   myform.appendChild(field);
}
