import uuidv4 from "uuid/v4";
import { validateSchema } from "./validation";

const LineSchema = {
  id: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  songTitle: {
    type: String,
    required: true
  },
  album: {
    type: String
  },
  thumbnail: {
    type: String
  },
  language: {
    type: String,
    required: true,
    enum: ["en", "de"]
  },
  moreUrl: {
    type: String
  },
  active: {
    type: Boolean,
    default: false,
    required: true
  }
};

export function createLine(data) {
  const line = validateSchema(data, LineSchema);
  // remove empty string attributes, because they throw a ValidationException in DynamoDB
  // https://github.com/aws/aws-sdk-js/issues/833
  Object.keys(line).forEach(field => {
    if (typeof line[field] === "string" && line[field] === "")
      delete line[field];
  });
  if (!line.id) line.id = uuidv4();
  line.updatedAt = new Date().getTime();
  return line;
}

// returns the DB representation of the line
export function untransformLine(line) {
  // we do this because secondary indexes (+sort keys) cannot be booleans
  // also because we can use the best practice of sparse indexes
  // http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GuidelinesForLSI.html#GuidelinesForLSI.SparseIndexes
  line.active = line.active ? "y" : "n";
  return line;
}

// returns the object representation of the line
export function transformLine(line) {
  line.active = line.active !== "n";
  return line;
}
