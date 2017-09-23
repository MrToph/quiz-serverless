import moment from "moment";
import genius from "../../libs/genius/api";

routes.get(
  "/scrape/fillWithTestLines",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    for (let i = 0; i < 250; i += 1) {
      const newLine = new Line({
        text: `Sample Text ${i}`,
        artist: "KIZ",
        songTitle: "Sample Song",
        language: "de",
        moreUrl: `http://kiz.com/${i}`,
        active: false
      });

      newLine.save(err => {
        if (err) {
          res.status(400).json(createError(`Database error: ${err}`));
        }
      });
    }
    res.json({});
  }
);

function storeLineInDB(line) {
  const { text, url, artist, title, album, thumbnail } = line;
  console.log(line);
  const newLine = new Line({
    text,
    artist,
    songTitle: title,
    album,
    thumbnail,
    language: "de", // TODO: get this from artist?
    moreUrl: url,
    active: false
  });

  newLine.save(err => {
    if (err) {
      console.error(createError(`Database error: ${err}`));
    }
  });
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

routes.post(
  "/scrape/popular",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { artistNames, numberOfSongsToParse } = req.body;
    if (!artistNames || !numberOfSongsToParse) {
      res
        .status(400)
        .json(
          createError(
            'Please pass both "artistNames" and "numberOfSongsToParse".'
          )
        );
      return;
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

    res.json({});
  }
);

routes.post(
  "/scrape/date",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { artistNames, timestampToParseFrom } = req.body;
    if (!artistNames || !timestampToParseFrom) {
      res
        .status(400)
        .json(
          createError(
            'Please pass both "artistNames" and "timestampToParseFrom".'
          )
        );
      return;
    }
    const sinceDate = moment(timestampToParseFrom);
    if (!sinceDate.isValid()) {
      res
        .status(400)
        .json(
          createError('Please pass a _valid_ "timestampToParseFrom" parameter.')
        );
      return;
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

    res.json({});
  }
);

export default routes;
