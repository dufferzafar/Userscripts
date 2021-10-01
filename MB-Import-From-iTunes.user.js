// ==UserScript==
// @name        MusicBrainz: Import from iTunes
// @description Import releases from iTunes
// @version     2021.10.01.0
// @author      -
// @namespace   http://github.com/dufferzafar/Userscripts
//
// @include     *://itunes.apple.com/*
// @include     *://music.apple.com/*
//
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
//
// @run-at      document-idle
// @connect     itunes.apple.com
// @grant       GM.xmlHttpRequest
// @icon        https://musicbrainz.org/favicon.ico
//
// @docs        https://wiki.musicbrainz.org/Development/Release_Editor_Seeding#Track_artist_credits
//
// ==/UserScript==
//**************************************************************************//
/* global waitForKeyElements */

var myform = document.createElement("form");
var artist = '', album = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;
var m;
var left;
var product, buttons;

waitForKeyElements(".product-info", run);

function run() {
    if (m = /^https?:\/\/(itunes|music).apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?(id)?([0-9]+)/.exec(document.location.href)) {
        var lookup_url = 'itunes.apple.com';
        country = m[2];
        var id = m[4];

        var url = document.location.protocol + "//" + lookup_url + "/lookup?id=" + id + "&entity=song&limit=200";
        if (country) url = url + "&country=" + country;
        GM.xmlHttpRequest ( {
            method:     'GET',
            url:        url,
            onload:     callbackFunction
        } );
    }
}

function callbackFunction(responseDetails) {

    myform.innerHTML = '';
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

            // Fixing "trackname" and "trackCensoredName" differences
            if (r.results[i].trackCensoredName && trackname !== r.results[i].trackCensoredName) {
                trackname += r.results[i].trackCensoredName.substr(trackname.length);
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
    add_field("urls.0.link_type", "980");
    add_field("urls.0.url", document.location.href);

    // label
    var copyright = document.getElementsByClassName('bottom-metadata')[0].getElementsByClassName('song-copyright')[0].innerText,
        labels = copyright.replace(/℗\s*\d{4}/g, '').split(/\s*(?:\/)\s*/);
    labels.forEach((label, x) => {
        add_field("labels." + x + ".name", label.trim());
    });

    left = document.getElementById('web-navigation-container');
    product = document.getElementsByClassName('product-info')[0];

    buttons = document.createElement("div");
    buttons.classList.add("button-content");
    document.getElementsByClassName('bottom-metadata')[0].appendChild(buttons);

    // Stylize our button
    var btnsCSS = document.createElement("style");
    btnsCSS.type = "text/css";
    btnsCSS.innerHTML = '.artLink, .mbForm { display: inline-block; margin-top: 10px; } .mbForm { margin-inline-end: 8px; }';
    document.body.appendChild(btnsCSS);

    addArtworkLink();
    addImportButton();
    clearInterval(intervalId);

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
    // Removing existing links
    var elsArt = document.getElementsByClassName('artLink');
    for (var i = 0 ; i < elsArt.length ; i++) {
        elsArt[i].remove();
    }

    // Add a link to download artwork
    var linkCSS = document.createElement("style");
    linkCSS.type = "text/css";
    linkCSS.innerHTML = ".artLink {float: right; margin-top: 10px;} .artLink button, .artLink a, .artLink button span.btn-text, .artLink a span.btn-text { -webkit-margin-end: 0 !important; margin-inline-end: 0 !important; }";
    document.body.appendChild(linkCSS);

    var divArtwork = product.getElementsByClassName('media-artwork-v2')[0],
        imagePicture = divArtwork.getElementsByTagName('source')[1],
        srcset = imagePicture.getAttribute('srcset');
    var src = srcset.split(',')[0].slice(0, -3).replace(/(.*jpg) .*$/, '$1').replace(/(\/)(\d+x\d+).*(bb(\-\d+)?\.jpg)$/, '$19999x9999$3');

    var artLinkP = document.createElement("div");
    var artLink = document.createElement("a");
    var artLinkSpan = document.createElement("span");
    artLinkSpan.textContent = "Link to HD Artwork";
    artLinkSpan.classList.add('btn-text');
    artLink.setAttribute("href", src);
    artLink.setAttribute("target", "_blank");
    artLink.classList.add('web-add-to-library');
    artLink.classList.add('add-to-library');
    artLink.classList.add('not-in-library');
    artLink.classList.add('round-button');
    artLink.classList.add('typography-label');
    artLink.classList.add('is-pill');
    artLink.classList.add('typ-label');
    artLink.addEventListener("click", function (event) { event.stopPropagation(); });
    artLinkP.classList.add("artLink");
    artLink.appendChild(artLinkSpan);
    artLinkP.appendChild(artLink);
    buttons.appendChild(artLinkP);
}

function addImportButton() {
    myform.method="post";
    myform.target = "blank";
    myform.action = document.location.protocol + "//musicbrainz.org/release/add";
    myform.acceptCharset = "UTF-8";

    // Stylize our button
    var btnCSS = document.createElement("style");
    btnCSS.type = "text/css";
    document.body.appendChild(btnCSS);

    var mysubmit = document.createElement("input");
    mysubmit.type = "submit";
    mysubmit.value = "Add to MusicBrainz";
    mysubmit.classList.add("mbBtn");
    mysubmit.classList.add("play-button");
    mysubmit.classList.add("action-button");
    mysubmit.classList.add("typography-label-emphasized");
    myform.appendChild(mysubmit);

    var div = document.createElement("div");
    div.classList.add("mbForm");
    div.appendChild(myform);
    buttons.appendChild(div);
}
