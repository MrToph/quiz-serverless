import uuidv4 from "uuid/v4";
import { createLine, untransformLine } from "../../libs/lines";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context, callback) {
  try {
    const line = untransformLine(createLine(JSON.parse(event.body)));
    const params = {
      TableName: "rapquiz.lines",
      Item: line
    };

    const result = await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function random(event, context, callback) {
  const params = {
    TableName: "rapquiz.lines",
    Item: {
      language: "de",
      artist: "Logic"
    }
  };

  try {
    for (let i = 0; i < 100; i++) {
      const id = uuidv4();
      console.log("Created ", i, id);
      params.Item.id = id;
      params.Item.text = Math.random().toString(36);
      params.Item.album = Math.random().toString(36).split(".").pop();
      params.Item.songTitle = Math.random().toString(36).split(".").pop();
      params.Item.moreUrl = `https://${uuidv4()}.com`;
      params.Item.active = !!(i % 2);
      params.Item = untransformLine(createLine(params.Item));
      await dynamoDbLib.call("put", params);
    }
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function indexes(event, context, callback) {
  async function getItemIds() {
    let keys = [];
    let lastEvaluatedKeyParams = {};
    do {
      const result = await dynamoDbLib.call("scan", {
        TableName: "rapquiz.lines",
        FilterExpression: "#id <> :indexes",
        ProjectionExpression: "#id",
        ExpressionAttributeNames: {
          "#id": "id"
        },
        ExpressionAttributeValues: {
          ":indexes": "indexes"
        },
        ...lastEvaluatedKeyParams,
      });

      if (result.LastEvaluatedKey) {
        lastEvaluatedKeyParams = {
          ExclusiveStartKey: result.LastEvaluatedKey
        };
      } else {
        lastEvaluatedKeyParams = {};
      }
      if (!result.Items) throw new Error("No more items present");
      keys = keys.concat(result.Items.map(item => item.id));
    } while (Object.keys(lastEvaluatedKeyParams).length > 0);
    return keys;
  }

  try {
    let { Item } = await dynamoDbLib.call("get", {
      TableName: "rapquiz.lines",
      Key: {
        id: "indexes"
      }
    });
    const indexesExist = !!Item;

    const keys = await getItemIds();
    const result = await dynamoDbLib.call("scan", {
      TableName: "rapquiz.lines",
      FilterExpression: "#id <> :indexes",
      ProjectionExpression: "#id",
      ExpressionAttributeNames: {
        "#id": "id"
      },
      ExpressionAttributeValues: {
        ":indexes": "indexes"
      }
    });
    console.log(`lines.create.indexes: Found ${keys.length} lines`);
    if (indexesExist) {
      const result = dynamoDbLib.call("update", {
        TableName: "rapquiz.lines",
        Key: {
          id: "indexes"
        },
        UpdateExpression: "SET #keys = :keys",
        ExpressionAttributeNames: {
          "#keys": "keys"
        },
        ExpressionAttributeValues: {
          ":keys": keys
        },
        ReturnValues: "ALL_NEW"
      });
      return void callback(null, success({ result }));
    } else {
      const result = await dynamoDbLib.call("put", {
        TableName: "rapquiz.lines",
        Item: {
          id: "indexes",
          keys
        }
      });
      return void callback(null, success({ result }));
    }
  } catch (e) {
    console.log(e);
    return void callback(null, failure({ status: false }));
  }
}
