import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

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
      callback(null, success(result.Item));
    } else {
      callback(null, failure({ status: false, error: "Item not found." }));
    }
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}

export async function all(event, context, callback) {
  const params = {
    TableName: "rapquiz.lines",
    FilterExpression: "#id <> :indexes",
    ExpressionAttributeNames: {
      "#id": "id"
    },
    ExpressionAttributeValues: {
      ":indexes": "indexes"
    },
    ReturnConsumedCapacity: "TOTAL"
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    if (result.Items) {
      callback(null, success(result.Items));
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
