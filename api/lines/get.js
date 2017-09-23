import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import { transformLine } from "../../libs/lines";

export async function main(event, context, callback) {
  const params = {
    TableName: "rapquiz.lines",
    Key: {
      id: event.pathParameters.id
    }
  };
  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      callback(null, success(transformLine(result.Item)));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function all(event, context, callback) {
  const linesPerRequest = 30;
  try {
    const { lineStatus, fromId } = event.queryStringParameters;
    const lineStatusString = lineStatus === "true" ? "y" : "n";
    const params = {
      TableName: "rapquiz.lines",
      IndexName: "active-index",
      KeyConditionExpression: "#active = :lineStatus",
      FilterExpression: "#id <> :indexes",
      ExpressionAttributeNames: {
        "#id": "id",
        "#active": "active"
      },
      ExpressionAttributeValues: {
        ":indexes": "indexes",
        ":lineStatus": lineStatusString
      },
      Limit: linesPerRequest,
      ReturnConsumedCapacity: "TOTAL"
    };
    if (fromId) params.ExclusiveStartKey = JSON.parse(fromId); // result.LastEvaluatedKey
    const result = await dynamoDbLib.call("query", params);
    if (result.Items) {
      result.Items = result.Items.map(item => transformLine(item));
      callback(null, success(result));
    } else {
      callback(null, failure({ status: false, error: "No items found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function indexes(event, context, callback) {
  const params = {
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

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      callback(null, success(result.Item));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
