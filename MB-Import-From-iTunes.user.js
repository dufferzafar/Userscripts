// ==UserScript==
// @name        MusicBrainz: Import from iTunes
// @description Import releases from iTunes
// @version     2020.08.23.0
// @author      -
// @namespace   http://github.com/dufferzafar/Userscripts
//
// @include     *://itunes.apple.com/*
// @include     *://music.apple.com/*
// @run-at      document-idle
// @grant       GM_xmlhttpRequest
// @connect     itunes.apple.com
//
// ==/UserScript==
//**************************************************************************//

var myform = document.createElement("form");
var artist = '', album = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;
var m;
var left;

if (m = /^https?:\/\/(itunes|music).apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?(id)?([0-9]+)/.exec(document.location.href)) {
    var lookup_url = 'itunes.apple.com';
    country = m[2];
    var id = m[4];

    var url = document.location.protocol + "//" + lookup_url + "/lookup?id=" + id + "&entity=song&limit=200";
    if (country) url = url + "&country=" + country;
    GM_xmlhttpRequest ( {
        method:     'GET',
        url:        url,
        onload:     callbackFunction
    } );
}

function callbackFunction(responseDetails) {

    let intervalId;
    var r = JSON.parse(responseDetails.responseText);

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
                if (j !== artists.length - 1) {
                    add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".join_phrase", join_phrase);
                }
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

    intervalId = setInterval(() => { if (document.getElementsByClassName('hydrated')[0]) {
        left = document.getElementById('web-navigation-container');
        addArtworkLink();
        addImportButton();
        clearInterval(intervalId);
    } }, 100);

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
    linkCSS.innerHTML = ".artLink {margin-left: 25px; margin-top: 10px;}";
    document.body.appendChild(linkCSS);

    var imageDiv = document.getElementsByClassName('media-artwork-v2--downloaded')[0];
    var imageImg = imageDiv.getElementsByTagName('img')[0];
    var srcset = imageImg.getAttribute('srcset');
    var splitSrcset = srcset.split(',')
    var src = splitSrcset[splitSrcset.length - 1].slice(0, -5);

    var artLinkP = document.createElement("div");
    var artLink = document.createElement("a");
    artLink.setAttribute("href", src);
    artLink.setAttribute("target", "_blank");
    artLink.textContent = "Link to HD Artwork";
    artLink.addEventListener("click", function (event) { event.stopPropagation(); });
    artLinkP.classList.add("artLink");
    artLinkP.appendChild(artLink);
    left.appendChild(artLinkP);
}

function addImportButton() {
    myform.method="post";
    myform.target = "blank";
    myform.action = document.location.protocol + "//musicbrainz.org/release/add";
    myform.acceptCharset = "UTF-8";

    // Stylize our button
    var btnCSS = document.createElement("style");
    btnCSS.type = "text/css";
    btnCSS.innerHTML = ".mbBtn {margin-left: 25px; margin-top: 25px; border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}";
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
