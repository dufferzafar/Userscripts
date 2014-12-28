// ==UserScript==
// @name        MusicBrainz: Import from iTunes
// @description Import releases from iTunes
// @version     2014-06-21
// @author      -
// @namespace   http://userscripts.org/users/41307
//
// @include     *://itunes.apple.com/*
//
// ==/UserScript==
//**************************************************************************//

var myform = document.createElement("form");
myform.method="post";
myform.target = "blank";
myform.action = document.location.protocol + "//musicbrainz.org/release/add";
myform.acceptCharset = "UTF-8";

// Stylize our button
var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
if (document.getElementsByClassName('view-more').length)
{
	btnCSS.innerHTML = ".mbBtn {border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-top: 25px; margin-right: -150px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}"
}
else
{
	btnCSS.innerHTML = ".mbBtn {border: 1px solid #ABABAB; cursor: pointer; border-radius: 4px; padding: 10px 15px; background: #F7F7F7;} .mbBtn:hover {background: #DEDEDE}"
}
document.body.appendChild(btnCSS);

var mysubmit = document.createElement("input");
mysubmit.type = "submit";
mysubmit.value = "Add to MusicBrainz";
mysubmit.classList.add("mbBtn");
myform.appendChild(mysubmit);

// Add a link to download artwork
var linkCSS = document.createElement("style");
linkCSS.type = "text/css";
linkCSS.innerHTML = ".artLink {margin-top: 10px;}"
document.body.appendChild(linkCSS);

var left = document.getElementById('left-stack');
var art = left.getElementsByTagName('img')[0];
src = art.getAttribute('src-swap-high-dpi');
var viewBtn = left.getElementsByClassName('view-in-itunes')[0];

var artLink = document.createElement("p");
artLink.innerHTML = "Artwork: <a href="+ src.replace(/340x340/g, "600x600")+">600px</a>"+
									", <a href="+ src.replace(/340x340/g, "1200x1200") +">1200px</a>";
artLink.classList.add("artLink");

viewBtn.parentNode.insertBefore(artLink, viewBtn);

var div = document.createElement("div");
div.classList.add("right");

var artist = '', album = '', label = '', year = 0, month = 0, day = 0, country = 'XW', type = 'album', discs = 0;

if (m = /^https?:\/\/itunes.apple.com\/(?:([a-z]{2})\/)?album\/(?:[^\/]+\/)?id([0-9]+)/.exec(document.location.href)) {
	country = m[1];

	var url = document.location.protocol + "//itunes.apple.com/lookup?id=" + m[2] + "&entity=song&limit=200";
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
//  var r = $.parseJSON(xmlhttp.responseText);

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
			add_field("mediums." + discno + ".track." + trackno + ".length", r.results[i].trackTimeMillis);

			var artists = r.results[i].artistName.split(/[,&]/);
			for (var j = 0; j < artists.length; j++) {
				add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".name", artists[j].trim());
				var join_phrase = (j != artists.length - 1) ? (j == artists.length - 2) ? " & " : ", " : "";
				if (j != artists.length - 1)
					add_field("mediums." + discno + ".track." + trackno + ".artist_credit.names." + j + ".join_phrase", join_phrase);
			}
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
	add_field("edit_note", "Imported from: "+ document.location.href +
						  " using https://github.com/dufferzafar/Userscripts/blob/master/MB-Import-From-iTunes.user.js");
	add_field("urls.0.link_type", "74");
	add_field("urls.0.url", document.location.href);

	div.appendChild(myform);
	document.getElementById('title').appendChild(div);
}

//////////////////////////////////////////////////////////////////////////////

function add_field (name, value) {
	var field = document.createElement("input");
	field.type = "hidden";
	field.name = name;
	field.value = value;
	myform.appendChild(field);
}
