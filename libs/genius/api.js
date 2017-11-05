import Genius from "genius-api";
import fetch from "node-fetch";
import cheerio from "cheerio";
import moment from "moment";
import { sample } from "lodash";

const accessToken = require("./credentials.json").client.accessToken;

export function handleErrors(response) {
  if (!response.Error) {
    return response;
  }
  throw new Error(JSON.stringify(response));
}

export function parseAndHandleErrors(response) {
  if (response.ok) {
    return response.text();
  }
  return response.json().then(obj => {
    throw new Error(JSON.stringify(obj));
  });
}

// genius API does not have an artist entrypoint.
// Instead, search for the artist => get a song by that artist => get API info on that song => get artist id
Genius.prototype.getArtistInfoByName = function getArtistInfoByName(
  artistName
) {
  const normalizeName = name => name.replace(/\./g, "").toLowerCase();
  const artistNameNormalized = normalizeName(artistName);
  return this.search(`${artistName}`)
    .then(handleErrors)
    .then(response => {
      for (let i = 0; i < response.hits.length; i += 1) {
        const hit = response.hits[i];
        // console.log(hit.result.primary_artist.name);
        if (
          hit.type === "song" &&
          normalizeName(hit.result.primary_artist.name) === artistNameNormalized
        ) {
          return hit.result;
        }
      }

      throw new Error(
        `Did not find any songs whose artist is "${artistNameNormalized}".`
      );
    })
    .then(songInfo => songInfo.primary_artist);
};

Genius.prototype.getArtistIdByName = function getArtistIdByName(artistName) {
  return this.getArtistInfoByName(artistName).then(artistInfo => ({
    artistId: artistInfo.id,
    artistName
  }));
};

Genius.prototype.getArtistUrlByName = function getArtistUrlByName(artistName) {
  return this.getArtistInfoByName(artistName).then(
    artistInfo => artistInfo.url
  );
};

function extractRelevantSongFields(response) {
  return {
    title: response.title,
    full_title: response.full_title,
    url: response.url,
    thumbnail: response.song_art_image_thumbnail_url ||
      response.header_image_thumbnail_url,
    id: response.id,
    api_path: response.api_path
  };
}

// we need to filter out useless collections like Rap-genius-deutschland
export function filterSongList(response) {
  return response.songs.filter(song => song.primary_artist.id !== 71621);
}

Genius.prototype.getSongsByPopularity = function getSongsByPopularity(
  artistId,
  amountOfSongs
) {
  return this.songsByArtist(artistId, {
    per_page: amountOfSongs,
    sort: "popularity"
  })
    .then(handleErrors)
    .then(filterSongList)
    .then(songs => songs.map(song => extractRelevantSongFields(song)));
};

Genius.prototype.extractSongsMatchingDateRange = function extractSongsMatchingDateRange(
  response,
  sinceDate
) {
  return new Promise(resolve => resolve(response))
    .then(filterSongList)
    .then(songs => songs.map(song => extractRelevantSongFields(song)))
    .then(songs =>
      Promise.all(
        songs.map(song =>
          this.getSongLyrics(song.url).then(songDetails => ({
            ...song,
            ...songDetails
          }))
        )
      )
    )
    .then(mergedSongsDetails =>
      mergedSongsDetails.filter(
        song =>
          console.log(song.title, song.releaseDate) ||
          (song.releaseDate.isValid() && song.releaseDate.isAfter(sinceDate))
      )
    );
};

Genius.prototype.getSongsSinceDate = function getSongsSinceDate(
  artistId,
  sinceDate
) {
  const allSongs = [];
  const iteratePage = page =>
    this.songsByArtist(artistId, {
      per_page: 10,
      page
    })
      .then(handleErrors)
      .then(response => {
        const nextPage = response.next_page;
        return this.extractSongsMatchingDateRange(
          response,
          sinceDate
        ).then(newSongs => ({ songs: newSongs, nextPage }));
      })
      .then(({ songs, nextPage }) => {
        allSongs.push(...songs);
        console.log(`New songs since data for page ${page}.`, songs);
        if (nextPage > page) return iteratePage(nextPage);
        return allSongs;
      });
  return iteratePage(1);
};

function parseSongHTML(htmlText) {
  const $ = cheerio.load(htmlText);
  const lyrics = $(".lyrics").text();
  let releaseDate = $(".metadata_unit-label:contains(Release Date) + span")
    .text()
    .trim();
  if (releaseDate) {
    releaseDate = moment(releaseDate, "MMMM DD, YYYY"); // August 24, 2007
  } else {
    // try to get release date from album release _year_
    releaseDate = $(".song_album-info-release_year")
      .text()
      .replace(/[\D]*/g, "");
    if (releaseDate) {
      releaseDate = moment(`31-12-${releaseDate}`, "DD-MM-YYYY");
    } else releaseDate = moment.invalid(); // set it to end of year for comparison reasons
  }
  return {
    lyrics,
    releaseDate
  };
}

// have to parse the song lyrics ourselves, genius API cannot provide lyrics because of licensing issues
Genius.prototype.getSongLyrics = function getSongLyrics(geniusUrl) {
  return fetch(geniusUrl, {
    method: "GET"
  })
    .then(parseAndHandleErrors)
    .then(parseSongHTML);
};

function extractRelevantLineFields(response, song, artistName) {
  return {
    ...song,
    text: response.fragment,
    url: response.url || song.url,
    artist: artistName
  };
}

Genius.prototype.getSongReferents = function getSongReferents(
  song,
  artistName
) {
  const songId = song.id;
  return this.referents(
    { song_id: songId },
    {
      per_page: 50
    }
  )
    .then(handleErrors)
    .then(response =>
      response.referents.map(referent =>
        extractRelevantLineFields(referent, song, artistName)
      )
    );
};

function extractRandomLinesFromLyrics(lyrics) {
  // remove [Hook] or [Verse 1] from lyrics
  let newLyrics = lyrics.replace(/\[[\s\S]*?\]/g, "");
  newLyrics = newLyrics.replace(/^\s*\n/gm, ""); // removes empty lines
  newLyrics = newLyrics.split("\n");
  let indices = Array.from({ length: newLyrics.length - 2 }, (_, i) => i);
  const numberOfLines = 4;
  const lines = [];
  for (let i = 0; i < numberOfLines; i += 1) {
    const lineIndex = sample(indices);
    indices = indices.filter(index => index !== lineIndex);
    lines.push({
      fragment: [newLyrics[lineIndex], newLyrics[lineIndex + 1]].join("\n")
    });
  }
  return lines;
}

Genius.prototype.getRandomSongLines = function getRandomSongLines(
  song,
  artistName
) {
  return this.getSongLyrics(song.url).then(({ lyrics }) => {
    let lines = extractRandomLinesFromLyrics(lyrics);
    lines = lines.map(line =>
      extractRelevantLineFields(line, song, artistName)
    );
    return lines;
  });
};

const genius = new Genius(accessToken);

export default genius;
