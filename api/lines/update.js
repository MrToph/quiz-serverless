import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import { untransformLine } from "../../libs/lines";

export async function main(event, context, callback) {
  try {
    const data = untransformLine(JSON.parse(event.body));
    const params = {
      TableName: "rapquiz.lines",
      Key: {
        id: event.pathParameters.id
      },
      ...dynamoDbLib.createUpdateExpression(data),
      ReturnValues: "ALL_NEW"
    };
    const result = await dynamoDbLib.call("update", params);
    callback(null, success(result));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
