import { sampleSize, shuffle } from "lodash";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import { transformLine } from "../../libs/lines";

const numberOfLines = 10;

async function getArtistNames() {
  const params = {
    TableName: "rapquiz.artists",
    FilterExpression: "#name <> :indexes",
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ":indexes": "indexes"
    },
    ProjectionExpression: "#name",
    ReturnConsumedCapacity: "TOTAL"
  };

  const result = await dynamoDbLib.call("scan", params);
  if (result.Items) {
    return result.Items.map(({ name }) => name);
  } else {
    throw new Error(`Could not scan for artists.\n${JSON.stringify(result)}`);
  }
}

async function getRandomLines() {
  let params = {
    TableName: "rapquiz.lines",
    Key: {
      id: "indexes"
    },
    ProjectionExpression: "#keys",
    ExpressionAttributeNames: {
      "#keys": "keys"
    },
    ReturnConsumedCapacity: "TOTAL"
  };

  let result = await dynamoDbLib.call("get", params);
  if (!result.Item) {
    throw new Error(`Could not get ids for lines.\n${JSON.stringify(result)}`);
  }
  const ids = result.Item.keys;
  const randomIds = sampleSize(ids, numberOfLines);

  params = {
    RequestItems: {
      "rapquiz.lines": {
        Keys: randomIds.map(id => ({ id }))
      }
    },
    ReturnConsumedCapacity: "TOTAL"
  };
  result = await dynamoDbLib.call("batchGet", params);
  if (!result.Responses || !result.Responses["rapquiz.lines"]) {
    throw new Error(
      `Could not batch get random line ids.\n${JSON.stringify(result)}`
    );
  }
  return result.Responses["rapquiz.lines"];
}

function getPossibleAnswers(allArtistNames, correctArtistName) {
  if (!allArtistNames.some(artistName => artistName === correctArtistName))
    throw new Error(
      `Correct artist ${correctArtistName} not found in all artists.\n${JSON.stringify(allArtistNames)}`
    );
  const allOtherArtists = allArtistNames.filter(
    artistName => artistName !== correctArtistName
  );
  const possibleArtists = shuffle([
    ...sampleSize(allOtherArtists, 2),
    correctArtistName
  ]);
  const correctArtistIndex = possibleArtists.findIndex(
    artistName => artistName === correctArtistName
  );
  return {
    possibleArtists,
    correctArtistIndex
  };
}

function createQuizData(lines, artistNames) {
  return lines.map(line => {
    line.text = line.text.split("\n").map(row => row.trim()).join("\n");
    return {
      ...line,
      ...getPossibleAnswers(artistNames, line.artist)
    };
  });
}

export async function main(event, context, callback) {
  try {
    const artistNames = await getArtistNames();
    const lines = await getRandomLines();
    const quiz = createQuizData(lines, artistNames);
    callback(null, success(quiz));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
