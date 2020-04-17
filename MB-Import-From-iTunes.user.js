// ==UserScript==
// @name        MusicBrainz: Import from iTunes V2
// @description Import releases from iTunes
// @version     2019.05.23.0
// @author      -
// @namespace   http://github.com/dufferzafar/Userscripts
//
// @include     *://itunes.apple.com/*
// @include     *://music.apple.com/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
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
var buttons;

waitForKeyElements(".product-info", run);

function run() {
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
}

function callbackFunction(responseDetails) {

    myform.innerHTML = '';
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

    left = document.getElementsByClassName('product-info')[0];

    buttons = document.createElement("div");
    buttons.classList.add("button-content");
    // left.appendChild(buttons);
    document.getElementsByClassName('header-and-songs-list')[0].appendChild(buttons);

    // Stylize our button
    var btnsCSS = document.createElement("style");
    btnsCSS.type = "text/css";
    btnsCSS.innerHTML = '.artLink, .mbForm { display: inline-block; margin-top: 10px; } .mbForm { margin-inline-start: 8px; }';
    document.body.appendChild(btnsCSS);


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
    // Removing existing links
    var elsArt = document.getElementsByClassName('artLink');
    for (var i = 0 ; i < elsArt.length ; i++) {
        elsArt[i].remove();
    }

    // Add a link to download artwork
    var linkCSS = document.createElement("style");
    linkCSS.type = "text/css";
    linkCSS.innerHTML = ".artLink {margin-top: 10px;}";
    document.body.appendChild(linkCSS);

    var srcset = left.getElementsByClassName('media-artwork-v2__image')[0].getAttribute('srcset');
    var src = srcset.split(',')[0].slice(0, -3).replace(/(.*jpg) .*$/, '$1').replace(/(\/)(\d+x\d+).*(bb\.jpg)$/, '$1969x969$3');

    var artLink = document.createElement("p");

    artLink.innerHTML = "<button onclick=\"window.open('" + src + "')\" class=\"play-button action-button typography-label-emphasized\">Link to HD Artwork</button>";
    // artLink.innerHTML = "<a href="+ src +" about=\"_blank\">Link to HD Artwork</a>";
    artLink.classList.add("artLink");
    buttons.appendChild(artLink);
}

function addImportButton() {

    myform.method="post";
    myform.target = "blank";
    myform.action = document.location.protocol + "//musicbrainz.org/release/add";
    myform.acceptCharset = "UTF-8";

    // Stylize our button
    var btnCSS = document.createElement("style");
    btnCSS.type = "text/css";
    // btnCSS.innerHTML = ".mbBtn {margin-top: 25px; border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}";
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
