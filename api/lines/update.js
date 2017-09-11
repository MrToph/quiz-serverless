import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "rapquiz.lines",
    Key: {
      id: event.pathParameters.id
    },
    ...dynamoDbLib.createUpdateExpression(data),
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success(result));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
