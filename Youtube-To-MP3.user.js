// ==UserScript==
// @id             Youtube-To-MP3
// @name           Youtube-To-MP3
// @version        0.8
// @namespace      http://github.com/dufferzafar/Userscripts
// @author         dufferZafar
// @description    Download MP3 from a youtube video
// @include        *//www.youtube.com/*
// @run-at         document-end
// ==/UserScript==

GM_log("Youtube-To-Mp3 Started");

var subs = document.getElementsByClassName('yt-uix-button-subscription-container')[0]
// Stylize
var btnCSS = document.createElement("style");
btnCSS.type = "text/css";
btnCSS.innerHTML = ".mp3btn {margin-left: 10px;}"
document.body.appendChild(btnCSS);

var downSpan = document.createElement("span");
downSpan.classList.add("yt-uix-button-group");
downSpan.classList.add("mp3btn");

var downLink = document.createElement("a");
downLink.innerHTML = '<span class="yt-uix-button-content">Download MP3</span>'
downLink.target = "blank";
downLink.href = "http://youtubeinmp3.com/fetch/?video=" + document.URL
downLink.classList.add("yt-uix-button");
downLink.classList.add("yt-uix-button-reverse");
downLink.classList.add("yt-uix-button-default");

downSpan.appendChild(downLink)
subs.parentNode.insertBefore(downSpan, subs.nextSibling);

/*
Todo: This is the part that still needs to be done.

1.) Send a XHR request to youtubeinmp3.com's API, there's a direct download link in their json response.
2.) downLink.href = DIRECT_DOWNLOAD_LINK
*/

//simple XHR request in pure JavaScript
function xhrLoad(url, callback)
{
    console.log(url)
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ensureReadiness;
    function ensureReadiness()
    {
        if(xhr.readyState < 4)
            return;

        if(xhr.status !== 200)
            return;

        // all is well
        if(xhr.readyState === 4) {
            callback(xhr);
        }
    }
    xhr.open('GET', url, true);
    xhr.send('');
}

xhrLoad("http://youtubeinmp3.com/fetch/?api=advanced&format=JSON&video="+document.URL, function(xhr) {
    var result = xhr.responseText;
    console.log(result);
});
