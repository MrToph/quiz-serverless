import AWS from "aws-sdk";

AWS.config.update({ region: "eu-central-1" });

console.log(AWS.config);

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}
