// ==UserScript==
// @name        MusicBrainz: Import from iTunes
// @description Import releases from iTunes
// @version     2017.08.10.0
// @author      -
// @namespace   http://github.com/dufferzafar/Userscripts
//
// @include     *://itunes.apple.com/*
//
// ==/UserScript==
//**************************************************************************//

var myform = document.createElement("form");
var artist = '', album = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

if (m = /^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?(id)?([0-9]+)/.exec(document.location.href)) {
    country = m[1];

    var url = document.location.protocol + "//itunes.apple.com/lookup?id=" + m[3] + "&entity=song&limit=200";
    if (m[1]) url = url + "&country=" + m[1];
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', url, true);
    xmlhttp.onreadystatechange = function() { callbackFunction(xmlhttp); };
    xmlhttp.send(null);
}

function callbackFunction(req) {
    if (xmlhttp.readyState !== 4)
        return;
    var r = JSON.parse(xmlhttp.responseText);

    for (var i = 0; i < r.results.length; i++) {
        if (r.results[i].wrapperType === "collection") {
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
        } else if (r.results[i].wrapperType === "track") {
            var discno = r.results[i].discNumber - 1;
            var trackno = r.results[i].trackNumber - 1;
            discs = r.results[i].discCount;

            var trackname = r.results[i].trackName;
            if (r.results[i].trackCensoredName && trackname !== r.results[i].trackCensoredName) {
                var str1 = r.results[i].trackCensoredName.substr(0, trackname.length);
                var str2 = r.results[i].trackCensoredName.substr(trackname.length);
                if (trackname === str1 && str2.match(/^ \(.*\)$/)) {
                    trackname = r.results[i].trackCensoredName;
                }
            }

            add_field("mediums." + discno + ".track." + trackno + ".name", trackname);
            add_field("mediums." + discno + ".track." + trackno + ".length", r.results[i].trackTimeMillis);

            var artists = r.results[i].artistName.split(/[,&]/);
            for (var j = 0; j < artists.length; j++) {
                add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".name", artists[j].trim());
                var join_phrase = (j !== artists.length - 1) ? (j === artists.length - 2) ? " & " : ", " : "";
                if (j !== artists.length - 1)
                    add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".join_phrase", join_phrase);
            }
        }
    }

    for (i = 0; i < discs; i++) {
        add_field("mediums." + i + ".format", 'Digital Media');
    }

    add_field("name", album);
    add_field("artist_credit.names.0.artist.name", artist);
    add_field("packaging", 'None');
    add_field("date.year", year);
    add_field("date.month", month);
    add_field("date.day", day);
    add_field("country", country);
    add_field("status", "official");
    add_field("type", type);
    add_field("edit_note", "Imported from: "+ document.location.href +
                          " using https://github.com/dufferzafar/Userscripts/blob/master/MB-Import-From-iTunes.user.js");
    add_field("urls.0.link_type", "74");
    add_field("urls.0.url", document.location.href);

    left = document.getElementsByClassName('medium-5')[0];

    addArtworkLink();
    addImportButton();
}

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
    var field = document.createElement("input");
    field.type = "hidden";
    field.name = name;
    field.value = value;
    myform.appendChild(field);
}

function addArtworkLink() {
    // Add a link to download artwork
    var linkCSS = document.createElement("style");
    linkCSS.type = "text/css";
    linkCSS.innerHTML = ".artLink {margin-top: 10px;}";
    document.body.appendChild(linkCSS);

    var srcset = left.getElementsByTagName('source')[0].getAttribute('srcset');
    var src = srcset.split(',')[2].slice(0, -3);

    var artLink = document.createElement("p");
    artLink.innerHTML = "<a href="+ src +">Link to HD Artwork</a>";
    artLink.classList.add("artLink");
    left.appendChild(artLink);
}

function addImportButton() {
    myform.method="post";
    myform.target = "blank";
    myform.action = document.location.protocol + "//musicbrainz.org/release/add";
    myform.acceptCharset = "UTF-8";

    // Stylize our button
    var btnCSS = document.createElement("style");
    btnCSS.type = "text/css";
    btnCSS.innerHTML = ".mbBtn {margin-top: 25px; border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}";
    document.body.appendChild(btnCSS);

    var mysubmit = document.createElement("input");
    mysubmit.type = "submit";
    mysubmit.value = "Add to MusicBrainz";
    mysubmit.classList.add("mbBtn");
    myform.appendChild(mysubmit);

    var div = document.createElement("div");
    div.appendChild(myform);
    left.appendChild(div);
}
