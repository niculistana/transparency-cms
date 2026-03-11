import fs from "fs";
import path from "path";

export const getSQLString = (filePath: string) => {
  return fs
    .readFileSync(path.join(__dirname, "..", "..", "sql", filePath))
    .toString();
};
