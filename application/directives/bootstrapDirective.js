goreMbifa.directive('goreMbifaBootstrap', function () {
    return {
        template:
           `<style>
                #gorembifa-app {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 14px 18px 12px 18px;
                    margin: 0px 0px 12px 0px;
                }

                #gorembifa-app select {
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 3px;
                }

                #gorembifa-app form {
                    width: 100%;
                    display: block;
                    margin-bottom: 10px;
                }

                #gorembifa-app input[type="submit"] {
                    width: 100%;
                    height: 24px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);
                    margin: 10px 0px 0px 0px;
                    font-family: Arial, sans-serif;
                }

                #gorembifa-app #search-direct, #search-indexed {
                    width: 100%;
                    text-align: center;
                }

                #gorembifa-app #search-indexed div {
                    text-align: left;
                    margin: 10px 0px 0px 0px;
                }
            </style>
            <div id="gorembifa-app">
                <form method="{{ form.method }}" action="{{ form.action }}" accept-charset="{{ form.acceptCharset }}">
                    <select name="{{ form.primaryType.name }}" data-ng-model="form.primaryType.selectedType" data-ng-options="type.value for type in form.primaryType.types track by type.key"/>
                    <input type="hidden" name="name" value="{{ form.title }}"/>
                    <input type="hidden" name="artist_credit.names.0.name" value="{{ form.artist }}"/>
                    <input type="hidden" name="status" value="{{ form.status }}"/>
                    <input type="hidden" name="events.0.date.day" value="{{ form.releaseDate[0] }}"/>
                    <input type="hidden" name="events.0.date.month" value="{{ form.releaseDate[1] }}"/>
                    <input type="hidden" name="events.0.date.year" value="{{ form.releaseDate[2] }}"/>
                    <input type="hidden" name="labels.0.name" value="{{ form.label }}"/>
                    <input type="hidden" name="urls.0.link_type" value="{{ form.externalLinkType }}"/>
                    <input type="hidden" name="urls.0.url" value="{{ form.asin }}"/>
                    <discs data-ng-repeat="disc in form.tracklist.discs track by $index">
                        <input type="hidden" name="mediums.{{ $index }}.format" value="CD"/>
                        <tracks data-ng-repeat="track in disc.tracks" track by $index>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.number" value="{{ track.number }}"/>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.name" value="{{ track.title }}"/>
                            <input type="hidden" name="mediums.{{ $parent.$index }}.track.{{ $index }}.length" value="{{ track.length }}"/>
                        </tracks>
                    </discs>
                    <input type="hidden" name="edit_note" value="{{ form.editNote }}"/>
                    <input type="submit" value="Export to MusicBrainz"/>
                </form>
                <div id="search-direct">
                    <a href="{{ link.href }}?query={{ link.query }}&type={{ link.type }}&limit={{ link.limit }}&method={{ link.method }}"
                       title="Direct search uses exact matches only, but provides up to the minute correct results. If the result is empty, modify your search or try the indexed one.">
                       Direct search on MusicBrainz
                    </a>
                </div>
                <div id="search-indexed">
                    <a href="" title=" Search indexes are updated every 3 hours.">Indexed search results</a>
                    <div>
                        <ul data-ng-if="searchIndexed.error === false" data-ng-repeat="release in searchIndexed.releases">
                            <li>
                                {{ release['artist-credit'][0].artist.name }} - {{ release.title }}<br/>
                                Score: {{ release.score }}<br/>
                                Format: <media data-ng-repeat="media in release.media">{{ media.format }} </media>
                            </li>
                        </ul>
                        <span data-ng-if="searchIndexed.error == true">The indexed search was not available.</span>
                    </div>
                </div>
            </div>`
    };
});