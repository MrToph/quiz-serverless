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
  try {
    const { lineStatus, fromId } = event.queryStringParameters;
    console.log(lineStatus);
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
      ReturnConsumedCapacity: "TOTAL"
      // ExclusiveStartKey: fromId, // result.LastEvaluatedKey
    };
    const result = await dynamoDbLib.call("query", params);
    if (result.Items) {
      callback(null, success(result.Items.map(item => transformLine(item))));
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
    console.log(result.ConsumedCapacity);
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
