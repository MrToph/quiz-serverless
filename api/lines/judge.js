import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import { untransformLine } from "../../libs/lines";

export async function main(event, context, callback) {
  try {
    console.log(event.body);
    let { acceptLine } = JSON.parse(event.body);
    // acceptLine is still a string "true" or "false", parse it to boolean
    acceptLine = JSON.parse(acceptLine);
    if (typeof acceptLine !== "boolean") {
      callback(
        null,
        failure({
          status: false,
          error: `Body argument "acceptLine" must be a boolean, but was ${typeof acceptLine}. (${acceptLine})`
        })
      );
      return;
    }
    if (acceptLine) {
      const data = {
        active: true
      };
      const params = {
        TableName: "rapquiz.lines",
        Key: {
          id: event.pathParameters.id
        },
        ...dynamoDbLib.createUpdateExpression(untransformLine(data)),
        ReturnValues: "ALL_NEW"
      };
      const result = await dynamoDbLib.call("update", params);
      callback(null, success(result));
      return;
    }
    // otherwise delete the line
    const params = {
      TableName: "rapquiz.lines",
      Key: {
        id: event.pathParameters.id
      }
    };
    const result = await dynamoDbLib.call("delete", params);
    callback(null, success({ status: true }));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
