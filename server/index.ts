import { Client, ClientConfig } from "pg";
import format, { ident } from "pg-format";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { InsertCommentDao } from "./types";
import express, { Request, Response } from "express";
import cors from "cors";
import { getSQLString } from "./util";
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({ region: process.env.AWS_REGION });
const app = express();

app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(express.static("build"));
  app.use(cors());
} else {
  app.use(express.static(path.join(__dirname, "..", "app")));
}

let config: ClientConfig;
let db: Client;

try {
  const certificateFileName = process?.env?.AWS_CERTIFICATE_FILENAME;
  const connectionString = process?.env?.RDS_PSQL_CONNECTION_STRING;

  config = {
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      ca: fs
        .readFileSync(path.join(__dirname, "..", certificateFileName || ""))
        .toString(),
    },
  };

  db = new Client(config);
} catch (error) {
  console.log("Error setting up database", error);
}

app.get("/comments", async (req: Request, res: Response) => {
  const getAllCommentsQuery = getSQLString("comment/get-all-comments.sql");

  try {
    const comments = await db.query(getAllCommentsQuery);
    return res.status(200).json(comments.rows[0].json_agg);
  } catch (error) {
    return res.status(500);
  }
});

app.put("/comment", async (req: Request, res: Response) => {
  const { comment_id, text, author, likes, image } = req.body;

  if (!comment_id) {
    return res.status(400).json({ message: "Bad Request" });
  }

  let updateCommentQuery;
  let parameters;
  if (likes) {
    updateCommentQuery = getSQLString("comment/update-comment-likes.sql");
    parameters = [likes, comment_id];
  } else if (text) {
    updateCommentQuery = getSQLString("comment/update-comment-text.sql");
    parameters = [text, comment_id];
  }

  if (!updateCommentQuery || !parameters) {
    return res.status(400).json({ message: "Bad Request" });
  }

  try {
    const comment = await db.query(updateCommentQuery, parameters);
    return res.status(200).json(comment.rows[0]);
  } catch (error) {
    return res.status(500);
  }
});

app.post("/comment", async (req: Request, res: Response) => {
  const { text, author, likes, image } = req.body;

  if (!text?.length || !author?.length || likes < 0 || !image?.length) {
    return res.status(400);
  }

  const insertCommentQuery = getSQLString("comment/insert-comment.sql");
  try {
    const comment = await db.query(insertCommentQuery, [
      text,
      author,
      likes,
      image,
    ]);
    return res.status(200).json(comment.rows[0]);
  } catch (error) {
    return res.status(500);
  }
});

app.delete("/comment", async (req: Request, res: Response) => {
  const id = req.body?.comment_id;
  const deleteCommentQuery = getSQLString("comment/delete-comment.sql");

  if (!id) {
    res.status(400).json({ message: "Bad Request" });
  }

  try {
    await db.query(deleteCommentQuery, [id]);

    return res.status(200).json({ message: "Deleted successfully." });
  } catch (error) {
    return res.status(500);
  }
});

app.get("/roles", async (req: Request, res: Response) => {
  const getAllRolesQuery = getSQLString("role/get-all-roles.sql");

  try {
    const roles = await db.query(getAllRolesQuery);
    return res.status(200).json(roles.rows[0].json_agg);
  } catch (error) {
    return res.status(500);
  }
});

app.post("/admin/bulk_insert_comments", async (req: Request, res: Response) => {
  const body = req.body;

  const comments = body?.comments || [];

  if (!comments?.length) {
    res.status(301).send({});
  } else {
    const bulkInsertCommentsQuery = getSQLString(
      "admin/bulk-insert-comments.sql",
    );

    const commentsAsList = comments.map((comment: InsertCommentDao) => {
      return [
        comment.author,
        comment.text,
        comment.likes,
        comment.image,
        comment.date,
      ];
    });

    const bulkInsertComments = format(bulkInsertCommentsQuery, commentsAsList);

    await db.query(bulkInsertComments);

    res.status(201).json({
      message: "Inserted records on the comments table.",
    });
  }
});

app.post(
  "/admin/create_comments_table",
  async (req: Request, res: Response) => {
    const createCommentDatabaseQuery = getSQLString(
      "admin/create-comments-table.sql",
    );

    await db.query(createCommentDatabaseQuery);

    res.status(201).json({
      message: "Created comments table.",
    });
  },
);

app.delete(
  "/admin/delete_comments_table",
  async (req: Request, res: Response) => {
    const deleteCommentDatabaseQuery = getSQLString(
      "admin/delete-comments-table.sql",
    );
    await db.query(deleteCommentDatabaseQuery);

    res.status(200).json({
      message: "Deleted comments table.",
    });
  },
);

app.post("/admin/create_roles_table", async (req: Request, res: Response) => {
  const createRolesTableQuery = getSQLString("admin/create-roles-table.sql");

  await db.query(createRolesTableQuery);

  res.status(201).json({
    message: "Created roles table.",
  });
});

app.post("/admin/seed_roles", async (req: Request, res: Response) => {
  const seedRolesQuery = getSQLString("admin/seed-roles.sql");

  await db.query(seedRolesQuery);

  res.status(201).json({
    message: "Seeded roles table.",
  });
});

app.delete("/admin/delete_roles_table", async (req: Request, res: Response) => {
  const deleteRolesTableQuery = getSQLString("admin/delete-roles-table.sql");
  await db.query(deleteRolesTableQuery);

  res.status(200).json({
    message: "Deleted roles table.",
  });
});

app.listen("3000", async () => {
  console.log("Server is up");

  try {
    await db.connect(() => {
      console.log("connected");
    });
  } catch (e) {
    console.log("Error setting up db");
    db.end();
  }
});
