import moment from "moment";
import genius from "../../libs/genius/api";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import { createLine, transformLine, untransformLine } from "../../libs/lines";

async function storeLineInDB(line) {
  const { text, url, artist, title, album, thumbnail } = line;
  console.log(line);
  const newLine = untransformLine(
    createLine({
      text,
      artist,
      songTitle: title,
      album,
      thumbnail,
      language: "de", // TODO: get this from artist?
      moreUrl: url,
      active: false
    })
  );

  const params = {
    TableName: "rapquiz.lines",
    Item: newLine
  };

  return await dynamoDbLib.call("put", params);
}

function scrapeSong(song, artistName) {
  console.log(`Scraping song ${artistName} - ${song.title}`);
  genius
    .getSongReferents(song, artistName)
    .then(referents => {
      const multiLineReferentsThreshold = 2;
      const multiLineReferents = referents.filter(ref =>
        ref.text.includes("\n")
      );
      if (multiLineReferents.length >= multiLineReferentsThreshold) {
        return multiLineReferents;
      }
      return genius.getRandomSongLines(song, artistName);
    })
    .then(lines => {
      lines.map(storeLineInDB);
    })
    .catch(err => console.log("scrapeSong - Error", err));
}

export async function popular(event, context, callback) {
  try {
    const { artistNames, numberOfSongsToParse } = JSON.parse(event.body);
    if (!artistNames || !numberOfSongsToParse) {
      throw new Error(
        'Please pass both "artistNames" and "numberOfSongsToParse".'
      );
    }

    console.log(
      "/scrape/popular",
      artistNames,
      artistNames.length,
      numberOfSongsToParse
    );

    for (let i = 0; i < artistNames.length; i += 1) {
      const artist = artistNames[i];
      genius
        .getArtistIdByName(artist)
        .then(({ artistId }) =>
          genius.getSongsByPopularity(artistId, numberOfSongsToParse)
        )
        .then(songs => {
          songs.forEach(song => setTimeout(() => scrapeSong(song, artist), 0));
        })
        .catch(err => res.status(400).json(createError(err)));
    }

    // const result = await dynamoDbLib.call("update", params);
    // immediately return for now
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false, error: JSON.stringify(e) }));
  }
}

export async function date(event, context, callback) {
  try {
    const { artistNames, timestampToParseFrom } = JSON.parse(event.body);
    if (!artistNames || !timestampToParseFrom) {
      throw new Error(
        'Please pass both "artistNames" and "timestampToParseFrom".'
      );
    }

    const sinceDate = moment(timestampToParseFrom);
    if (!sinceDate.isValid()) {
      throw new Error(
        'Please pass a _valid_ "timestampToParseFrom" parameter.'
      );
    }

    console.log("/scrape/date", artistNames, artistNames.length, sinceDate);

    for (let i = 0; i < artistNames.length; i += 1) {
      const artist = artistNames[i];
      genius
        .getArtistIdByName(artist)
        .then(({ artistId }) => genius.getSongsSinceDate(artistId, sinceDate))
        .then(songs => {
          songs.forEach(song => setTimeout(() => scrapeSong(song, artist), 0)); // TODO: we don't need to query genius again here
        })
        .catch(err => res.status(400).json(createError(err)));
    }

    // const result = await dynamoDbLib.call("update", params);
    // immediately return for now
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false, error: JSON.stringify(e) }));
  }
}
