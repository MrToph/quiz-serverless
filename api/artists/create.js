import uuidv4 from "uuid/v4";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "rapquiz.artists",
    Item: {
      name: data.name,
      url: data.url,
      createdAt: new Date().getTime()
    }
  };

  try {
    const result = await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function random(event, context, callback) {
  const params = {
    TableName: "rapquiz.artists",
    Item: {
      name: "",
      url: "",
      createdAt: new Date().getTime()
    }
  };

  try {
    for (let i = 0; i < 990; i++) {
      const key = uuidv4();
      console.log("Updated ", i, key);
      params.Item.name = key;
      params.Item.url = `https://${uuidv4()}.com`;
      await dynamoDbLib.call("put", params);
    }
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function indexes(event, context, callback) {
  try {
    let { Item } = await dynamoDbLib.call("get", {
      TableName: "rapquiz.artists",
      Key: {
        name: "indexes"
      }
    });
    const indexesExist = !!Item;

    const result = await dynamoDbLib.call("scan", {
      TableName: "rapquiz.artists",
      FilterExpression: "#name <> :indexes",
      ProjectionExpression: "#name",
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":indexes": "indexes"
      }
    });
    if (result.Items) {
      const keys = result.Items.map(item => item.name);
      if (indexesExist) {
        const result = dynamoDbLib.call("update", {
          TableName: "rapquiz.artists",
          Key: {
            name: "indexes"
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
          TableName: "rapquiz.artists",
          Item: {
            name: "indexes",
            keys
          }
        });
        return void callback(null, success({ result }));
      }
    } else {
      return void callback(
        null,
        failure({ status: false, error: "No items found." })
      );
    }
  } catch (e) {
    console.log(e);
    return void callback(null, failure({ status: false }));
  }
}
