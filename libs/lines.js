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
  if (!line.id) line.id = uuidv4();
  line.updatedAt = new Date().getTime();
  return line;
}
