// ==UserScript==
// @id              MusicBrainz-Import-from-Amazon
// @name            MusicBrainz: Import from Amazon
// @namespace       mb_import_from_amazon
// @include         *://www.amazon.*
// @version         0.91
// @grant           none
// @author          dufferZafar & Gore
// @description     Import releases from Amazon
// @run-at          document-end
// ==/UserScript==

// configuration
var navigationItem = document.getElementById('nav-subnav').getElementsByClassName('nav-a')[0].textContent;
var monthsDe = {"Januar": 1, "Februar": 2, "März": 3, "April": 4, "Mai": 5, "Juni": 6, "Juli": 7, "August": 8, "September": 9, "Oktober": 10, "November": 11, "Dezember": 12};
var monthsCom = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12}
var regexReleaseDate = /Audio CD  \((.*)\)/;
var regexReleaseLabel = /Label: (.*)/;

switch (navigationItem) {
    // amazon.com
    case "CDs & Vinyl":
        var months = monthsCom;
        var domain = 'com';
        var category = "cd";
        var disc = "Disc";
        var regexNumDiscs = /Number of Discs: (.*)/;
        break;

    case "Digital Music":
        var domain = 'com';
        var category = "mp3";
        break;

        // amazon.de
    case "Musik-CDs & Vinyl":
        var months = monthsDe;
        var domain = 'de';
        var category = "cd";
        var disc = "Disk";
        var regexNumDiscs = /Anzahl Disks\/Tonträger: (.*)/;
        break;

    case "Musik-Downloads":
        var domain = 'de';
        var category = "mp3";
        break;

        // amazon.ca (in english)
    case "Music":
        var months = monthsCom;
        var domain = 'ca';
        var category = "cd";
        var disc = "Disc";
        var regexNumDiscs = /Number of Discs: (.*)/;
        break;

        // amazon.ca (in french)
    case "Musique":
        var months = monthsCom;
        var domain = 'ca';
        var category = "cd";
        var disc = "Disc";
        var regexNumDiscs = /Number of Discs: (.*)/;
        break;

    default:
        return;
}

var css = document.createElement("style");

css.type = "text/css";
css.innerHTML = "#mbForm {border: 1px solid #DDDDDD; border-radius: 4px; padding: 10px 14px 10px 14px;}";
css.innerHTML += "#mbSubmit {border: 1px solid #6DAEE1; border-radius: 3px; cursor: pointer; padding: 4px 0px 4px 0px; margin: 5px 0px 0px 0px; width: 100%; background: #C9E1F4;} .mbSubmit:hover {background: #B2D3ED}";

document.body.appendChild(css);

var form = document.createElement("form");

form.id = "mbForm";
form.method="post";
form.target = "_blank";
form.action = "https://musicbrainz.org/release/add";
form.acceptCharset = "UTF-8";

var formSelectPrimaryType = document.createElement("select");
formSelectPrimaryType.name = "type";

createSelectOption(formSelectPrimaryType, "Primary Type", "");
createSelectOption(formSelectPrimaryType, "Album", "Album");
createSelectOption(formSelectPrimaryType, "Single", "Single");
createSelectOption(formSelectPrimaryType, "EP", "EP");
createSelectOption(formSelectPrimaryType, "Broadcast", "Broadcast");
createSelectOption(formSelectPrimaryType, "Other", "Other");

form.appendChild(formSelectPrimaryType);

switch (category) {
    case "cd":
        document.getElementById('tellAFriendBox_feature_div').appendChild(form);

        // Title of the Album
        // Todo: Use regex to extract ONLY album title
        createInput(form, "hidden", "name", document.getElementById('productTitle').textContent);

        // Album Artist (Composer)
        // Todo: Loop over <a> tags to find ALL composers
        var albumArtists = document.getElementsByClassName('author');
        var albumArtist = albumArtists[0].getElementsByTagName('a');
        createInput(form, "hidden", "artist_credit.names.0.name", albumArtist[0].textContent);

        // Date and Label
        var detailsTab = document.getElementById('productDetailsTable');
        var detailsList = detailsTab.getElementsByTagName('li');
        
        var match = null;
        var medium = 0;
        var track = 0;

        for (var i = 0; i < detailsList.length; i++) {   
            match = regexReleaseDate.exec(detailsList[i].textContent);
            
            if (match) {
                switch (domain) {
                    case "de":
                        var splittedDate = match[1].split(" ");

                        createInput(form, "hidden", "events.0.date.day", splittedDate[0].replace(/\./, ""));
                        createInput(form, "hidden", "events.0.date.month", months[splittedDate[1]]);
                        createInput(form, "hidden", "events.0.date.year", splittedDate[2]);
                        break;

                    case "com":
                        var splittedDate = match[1].split(" ");

                        createInput(form, "hidden", "events.0.date.day", splittedDate[1].replace(/,/, ""));
                        createInput(form, "hidden", "events.0.date.month", months[splittedDate[0]]);
                        createInput(form, "hidden", "events.0.date.year", splittedDate[2]);
                        break;
                }
            }

            match = regexReleaseLabel.exec(detailsList[i].textContent);

            if (match) {
                createInput(form, "hidden", "labels.0.name", match[1]);
            }
        }

        createInput(form, "hidden", "mediums." + medium + ".format", "CD");

        // Amazon has more than one track listing...
        if (document.getElementById("dmusic_tracklist_content")) {
            /*
                Track listings:

                One Disk: http://www.amazon.de/01-Fl%C3%BCsterer-Remastered-Gabriel-Burns/dp/B00N29D69I
                Multiple Disks: http://www.amazon.de/Book-Souls-limited-Deluxe/dp/B00ZVFYVMM
            */

            var tracklist = document.getElementById("dmusic_tracklist_content").getElementsByTagName("tr");
            
            for (var i = 1; i < tracklist.length; i++) {
                if (tracklist[i].id == "dmusic_tracklist_player_disc_" + (medium + 2))
                {
                    medium++;
                    track = 0;
                    createInput(form, "hidden", "mediums." + medium + ".format", "CD");

                    continue;
                }
                
                var trackDetails = tracklist[i].getElementsByTagName("td");

                if (trackDetails[0].getElementsByClassName("TrackNumber")[0]) {
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".number", trackDetails[0].getElementsByClassName("TrackNumber")[0].textContent);
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".name", trackDetails[1].getElementsByClassName("TitleLink")[0].textContent);
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".length", trackDetails[2].getElementsByTagName("span")[0].textContent.trim());
                }
                
                track++;
            }
        } else if (document.getElementById("dmusic_tracklist_player")) {
            /*
                Track listings:

                One Disk: 
                Multiple Disks: http://www.amazon.de/Deceiver-Gods-Amon-Amarth/dp/B00CEJ2H6K
            */

            var tracklist = document.getElementById("dmusic_tracklist_player").getElementsByClassName("a-row");

            for (var i = 1; i < tracklist.length; i++) {
                if (tracklist[i].textContent.trim() == disc + ": " + (medium + 2))
                {
                    medium++;
                    track = 0;
                    createInput(form, "hidden", "mediums." + medium + ".format", "CD");

                    continue;
                }

                var trackDetails = tracklist[i].textContent.split(". ");

                if (trackDetails[0].trim()) {
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".number", trackDetails[0].trim());
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".name", trackDetails[1].trim());
                }
            
                track++;
            }
        } else if (document.getElementById("musicTracksFeature")) {
            /*
                Track listings:

                One Disk: http://www.amazon.ca/gp/product/B00062PWOQ
                Multiple Disks: http://www.amazon.ca/The-Book-Souls-Deluxe-Hardcover/dp/B00ZVFYVMM
            */

            var tracklist = document.getElementById("musicTracksFeature").getElementsByTagName("tr");

            for (var i = 0; i < tracklist.length; i++) {
                if (tracklist[i].classList.contains("sampleTracksHeader"))
                {
                    if (i == 0) {
                        continue;
                    }

                    medium++;
                    track = 0;
                    createInput(form, "hidden", "mediums." + medium + ".format", "CD");

                    continue;
                }

                var trackDetails = tracklist[i].getElementsByTagName("td")[0].textContent.split(". ");
                                
                if (trackDetails[0].trim()) {
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".number", trackDetails[0].trim());
                    createInput(form, "hidden", "mediums." + medium + ".track." + track + ".name", trackDetails[1].trim());
                }

                track++;
            }
        }

        break;
}

createInput(form, "hidden", "status", "official");
createInput(form, "hidden", "edit_note", "Release added using the MB-Import-From-Amazon userscript from page: " + document.location.href);
createInput(form, "hidden", "urls.0.url", document.location.href);
createInput(form, "hidden", "urls.0.link_type", "77");

createInput(form, "submit", "", "Add Release to MusicBrainz", "mbSubmit");

function createInput(form, type, name, value, id, css) 
{
    var input = document.createElement("input");

    if (id) {
        input.id = id;
    }

    input.type = type;

    if (name) {
        input.name = name;
    }

    if (css) {
        input.classList.add(css);
    }
    
    input.value = value;

    form.appendChild(input);
}

function createSelectOption(select, text, value)
{
    var selectOption = document.createElement("option");

    selectOption.text = text;
    selectOption.value = value;

    select.add(selectOption);
}