import uuidv4 from "uuid/v4";
import { createLine } from "../../libs/lines";
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context, callback) {
  try {
    const line = createLine(JSON.parse(event.body));
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

export async function indexes(event, context, callback) {
  try {
    let { Item } = await dynamoDbLib.call("get", {
      TableName: "rapquiz.lines",
      Key: {
        id: "indexes"
      }
    });
    const indexesExist = !!Item;

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
    if (result.Items) {
      const keys = result.Items.map(item => item.id);
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
