import { Client, ClientConfig } from "pg";
import format, { ident } from "pg-format";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { InsertCommentDao, InsertDocumentDao } from "./types";
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

// Custom logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Call next to pass control to the next middleware/route handler
});

app.get("/admin/get_all_comments", async (req: Request, res: Response) => {
  const getAllCommentsQuery = getSQLString("admin/get-all-comments.sql");

  try {
    const comments = await db.query(getAllCommentsQuery);
    return res.status(200).json(comments.rows[0].json_agg || []);
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

app.put("/comment/flag", async (req: Request, res: Response) => {
  const { comment_id, flagged } = req.body;

  if (!comment_id || typeof flagged !== "boolean") {
    return res.status(400).json({ message: "Bad Request" });
  }

  const updateCommentFlagQuery = getSQLString(
    "comment/update-comment-flag.sql",
  );

  try {
    const comment = await db.query(updateCommentFlagQuery, [
      flagged,
      comment_id,
    ]);
    return res.status(200).json(comment.rows[0]);
  } catch (error) {
    return res.status(500);
  }
});

app.delete("/admin/delete_comment", async (req: Request, res: Response) => {
  const id = req.body?.comment_id;
  const deleteCommentQuery = getSQLString("admin/delete-comment.sql");

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

app.get("/documents", async (req: Request, res: Response) => {
  const getAllDocumentsQuery = getSQLString("document/get-all-documents.sql");

  try {
    const documents = await db.query(getAllDocumentsQuery);
    return res.status(200).json(documents.rows[0].json_agg);
  } catch (error) {
    return res.status(500);
  }
});

app.get("/documents/:id", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const getDocumentByIdQuery = getSQLString("document/get-document-by-id.sql");

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  try {
    const document = await db.query(getDocumentByIdQuery, [documentId]);

    if (document.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.status(200).json(document.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/documents/:id/comments", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const getCommentsByDocumentIdQuery = getSQLString(
    "document/get-comments-by-document-id.sql",
  );

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  try {
    const comments = await db.query(getCommentsByDocumentIdQuery, [documentId]);
    return res.status(200).json(comments.rows[0].json_agg || []);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/documents/:id/comments", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const { text, author, likes, image } = req.body;
  const insertDocumentCommentQuery = getSQLString(
    "document/insert-document-comment.sql",
  );

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  if (!text || !author) {
    return res
      .status(400)
      .json({ message: "Bad Request - text and author are required" });
  }

  try {
    const comment = await db.query(insertDocumentCommentQuery, [
      text,
      author,
      likes || 0,
      image || null,
      documentId,
    ]);
    return res.status(201).json(comment.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete(
  "/documents/:id/comment/:commentId",
  async (req: Request, res: Response) => {
    const documentId = req.params.id;
    const commentId = req.params.commentId;
    const unlinkCommentFromDocumentQuery = getSQLString(
      "admin/unlink-comment-from-document.sql",
    );

    if (!documentId || !commentId) {
      return res
        .status(400)
        .json({ message: "Bad Request - Document ID and Comment ID required" });
    }

    try {
      await db.query(unlinkCommentFromDocumentQuery, [documentId, commentId]);
      return res
        .status(200)
        .json({ message: "Comment unlinked from document" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

app.post(
  "/admin/create_documents_table",
  async (req: Request, res: Response) => {
    const createDocumentsTableQuery = getSQLString(
      "admin/create-documents-table.sql",
    );

    await db.query(createDocumentsTableQuery);

    res.status(201).json({
      message: "Created documents table.",
    });
  },
);

app.delete(
  "/admin/delete_documents_table",
  async (req: Request, res: Response) => {
    const deleteDocumentsTableQuery = getSQLString(
      "admin/delete-documents-table.sql",
    );
    await db.query(deleteDocumentsTableQuery);

    res.status(200).json({
      message: "Deleted documents table.",
    });
  },
);

app.post(
  "/admin/bulk_insert_documents",
  async (req: Request, res: Response) => {
    const body = req.body;

    const documents = body?.documents || [];

    if (!documents?.length) {
      res.status(301).send({});
    } else {
      const bulkInsertDocumentsQuery = getSQLString(
        "admin/bulk-insert-documents.sql",
      );

      const documentsAsList = documents.map((document: InsertDocumentDao) => {
        return [document.external_link, document.date];
      });

      const bulkInsertDocuments = format(
        bulkInsertDocumentsQuery,
        documentsAsList,
      );

      await db.query(bulkInsertDocuments);

      res.status(201).json({
        message: "Inserted records on the documents table.",
      });
    }
  },
);

// Document-Comment Relationship Endpoints
app.post(
  "/admin/create_document_comments_table",
  async (req: Request, res: Response) => {
    const createDocumentCommentsTableQuery = getSQLString(
      "admin/create-document-comments-table.sql",
    );
    await db.query(createDocumentCommentsTableQuery);

    res.status(201).json({
      message: "Created document_comments table.",
    });
  },
);

app.delete(
  "/admin/delete_document_comments_table",
  async (req: Request, res: Response) => {
    const deleteDocumentCommentsTableQuery = getSQLString(
      "admin/delete-document-comments-table.sql",
    );
    await db.query(deleteDocumentCommentsTableQuery);

    res.status(200).json({
      message: "Deleted document_comments table.",
    });
  },
);

app.post(
  "/admin/link_comment_to_document",
  async (req: Request, res: Response) => {
    const { document_id, comment_id } = req.body;

    if (!document_id || !comment_id) {
      return res.status(400).json({
        error: "document_id and comment_id are required",
      });
    }

    const linkCommentToDocumentQuery = getSQLString(
      "admin/link-comment-to-document.sql",
    );
    const result = await db.query(linkCommentToDocumentQuery, [
      document_id,
      comment_id,
    ]);

    res.status(201).json({
      message: "Linked comment to document.",
      data: result.rows[0],
    });
  },
);

app.post(
  "/admin/link_all_comments_to_document_25",
  async (req: Request, res: Response) => {
    const linkAllCommentsToDocument25Query = getSQLString(
      "admin/link-all-comments-to-document-25.sql",
    );
    await db.query(linkAllCommentsToDocument25Query);

    res.status(201).json({
      message: "Linked all comments to document 25.",
    });
  },
);

app.delete(
  "/admin/unlink_comment_from_document",
  async (req: Request, res: Response) => {
    const { document_id, comment_id } = req.body;

    if (!document_id || !comment_id) {
      return res.status(400).json({
        error: "document_id and comment_id are required",
      });
    }

    const unlinkCommentFromDocumentQuery = getSQLString(
      "admin/unlink-comment-from-document.sql",
    );
    await db.query(unlinkCommentFromDocumentQuery, [document_id, comment_id]);

    res.status(200).json({
      message: "Unlinked comment from document.",
    });
  },
);

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
