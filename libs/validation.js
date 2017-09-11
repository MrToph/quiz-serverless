export function validateSchema(data, schema) {
  // check required fields
  const fields = Object.keys(schema);
  const requiredFields = fields.filter(field => schema[field].required);
  const line = { ...data };
  requiredFields.forEach(field => {
    if (typeof line[field] === "undefined") {
      if (typeof schema[field].default !== "undefined") {
        line[field] = schema[field].default;
      } else {
        throw new Error(
          `Field "${field}" is required in the schema:\n ${JSON.stringify(data)}`
        );
      }
    }
  });

  // check correct field types
  fields.forEach(field => {
    if (
      typeof line[field] !== "undefined" &&
      typeof line[field] !== typeof schema[field].type()
    ) {
      throw new Error(
        `Field "${field}" is of type "${typeof line[field]}" but should be "${typeof schema[field].type()}": ${JSON.stringify(line[field])}`
      );
    }
  });

  // filter out field not defined in the schema
  Object.keys(line).forEach(lineField => {
    if (typeof schema[lineField] === "undefined") delete line[lineField];
  });

  return line;
}
