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

// configuration
var navigationItem = document.getElementById('nav-subnav').getElementsByClassName('nav-a')[0].textContent;
var monthsDe = {"Januar": 1, "Februar": 2, "März": 3, "April": 4, "Mai": 5, "Juni": 6, "Juli": 7, "August": 8, "September": 9, "Oktober": 10, "November": 11, "Dezember": 12};
var monthsCom = {"January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12}
var regexReleaseDate = /Audio CD  \((.*)\)/;
var regexReleaseLabel = /Label: (.*)/;

switch (navigationItem)
{
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

var form = document.createElement("form");
form.method="post";
form.target = "_blank";
form.action = "https://musicbrainz.org/release/add";
form.acceptCharset = "UTF-8";

var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
btnCSS.innerHTML = ".mbBtn {border: 1px solid #6DAEE1; cursor: pointer; border-radius: 4px; padding: 10px 15px; margin-bottom: -10x; width: 100%; background: #C9E1F4;} .mbBtn:hover {background: #B2D3ED}"
document.body.appendChild(btnCSS);

var addBtnElem = document.createElement("input");
addBtnElem.type = "submit";
addBtnElem.value = "Add release to MusicBrainz";
addBtnElem.classList.add("mbBtn");
form.appendChild(addBtnElem);

switch (category)
{
    case "cd":
        document.getElementById('tellAFriendBox_feature_div').appendChild(form);
        break;
}

addInputToForm(form, "status", "official");
addInputToForm(form, "edit_note", "Release added using the MB-Import-From-Amazon userscript from page: " + document.location.href);
addInputToForm(form, "urls.0.url", document.location.href);
addInputToForm(form, "urls.0.link_type", "77");

switch (category)
{
    case "cd":
        // Title of the Album
        // Todo: Use regex to extract ONLY album title
        addInputToForm(form, "name", document.getElementById('productTitle').textContent);

        // Album Artist (Composer)
        // Todo: Loop over <a> tags to find ALL composers
        var albumArtists = document.getElementsByClassName('author');
        var albumArtist = albumArtists[0].getElementsByTagName('a');
        addInputToForm(form, "artist_credit.names.0.name", albumArtist[0].textContent);

        // Date and Label
        var detailsTab = document.getElementById('productDetailsTable');
        var detailsList = detailsTab.getElementsByTagName('li');
        
        var match = null;

        for (var i = 0; i < detailsList.length; i++)
        {   
            match = regexReleaseDate.exec(detailsList[i].textContent);
            
            if (match)
            {
                switch (domain)
                {
                    case "de":
                        var splittedDate = match[1].split(" ");

                        addInputToForm(form, "events.0.date.day", splittedDate[0].replace(/\./, ""));
                        addInputToForm(form, "events.0.date.month", months[splittedDate[1]]);
                        addInputToForm(form, "events.0.date.year", splittedDate[2]);
                        break;

                    case "com":
                        var splittedDate = match[1].split(" ");

                        addInputToForm(form, "events.0.date.day", splittedDate[1].replace(/,/, ""));
                        addInputToForm(form, "events.0.date.month", months[splittedDate[0]]);
                        addInputToForm(form, "events.0.date.year", splittedDate[2]);
                        break;
                }
            }

            match = regexReleaseLabel.exec(detailsList[i].textContent);

            if (match)
            {
                addInputToForm(form, "labels.0.name", match[1]);
            }
        }

        var medium = 0;
        var track = 0;
        addInputToForm(form, "mediums.0.format", "CD");

        // Amazon has more than one track listing...
        if (document.getElementById("dmusic_tracklist_content")) 
        {
            var tracklist = document.getElementById("dmusic_tracklist_content").getElementsByTagName("tr");

            for (var i = 1; i < tracklist.length; i++)
            {
                if (tracklist[i].id == "dmusic_tracklist_player_disc_" + (medium + 2))
                {
                    medium++;
                    track = 0;
                    addInputToForm(form, "mediums." + medium + ".format", "CD");
                    continue;
                }

                var trackDetails = tracklist[i].getElementsByTagName("td");
                            
                addInputToForm(form, "mediums." + medium + ".track." + track + ".number", trackDetails[0].getElementsByClassName("TrackNumber")[0].textContent);
                addInputToForm(form, "mediums." + medium + ".track." + track + ".name", trackDetails[1].getElementsByClassName("TitleLink")[0].textContent);
                addInputToForm(form, "mediums." + medium + ".track." + track + ".length", trackDetails[2].getElementsByTagName("span")[0].textContent.trim());

                track++;
            }
        }
        else if (document.getElementById("dmusic_tracklist_player"))
        {
            var tracklist = document.getElementById("dmusic_tracklist_player").getElementsByClassName("a-row");

            for (var i = 1; i < tracklist.length; i++)
            {
                if (tracklist[i].textContent.trim() == disc + ": " + (medium + 2))
                {
                    medium++;
                    track = 0;
                    addInputToForm(form, "mediums." + medium + ".format", "CD");
                    continue;
                }

                var trackDetails = tracklist[i].textContent.split(". ");

                addInputToForm(form, "mediums." + medium + ".track." + track + ".number", trackDetails[0].trim());
                addInputToForm(form, "mediums." + medium + ".track." + track + ".name", trackDetails[1].trim());
            
                track++;
            }
        }
        break;
}

function addInputToForm(form, name, value) 
{
    var input = document.createElement("input");

    input.type = "hidden";
    input.name = name;
    input.value = value;

    form.appendChild(input);
}