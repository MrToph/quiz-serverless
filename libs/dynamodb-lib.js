import AWS from "aws-sdk";

AWS.config.update({ region: "eu-central-1" });

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}

export function createUpdateExpression(Item) {
  if (Object.keys(Item).length === 0) return {};
  const UpdateExpression =
    "SET " +
    Object.keys(Item)
      .map(field => {
        return `#${field} = :${field}`;
      })
      .join(", ");

  const ExpressionAttributeNames = Object.keys(Item).reduce((obj, field) => {
    return {
      ...obj,
      [`#${field}`]: field
    };
  }, {});

  const ExpressionAttributeValues = Object.keys(Item).reduce((obj, field) => {
    return {
      ...obj,
      [`:${field}`]: Item[field]
    };
  }, {});
  return {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues
  };
}
