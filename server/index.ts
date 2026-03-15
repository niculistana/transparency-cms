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

app.post(
  "/admin/create_activities_table",
  async (req: Request, res: Response) => {
    const createActivityTableQuery = getSQLString(
      "admin/create-activities-table.sql",
    );

    await db.query(createActivityTableQuery);

    res.status(201).json({
      message: "Created activities table.",
    });
  },
);

app.delete(
  "/admin/delete_activities_table",
  async (req: Request, res: Response) => {
    const deleteActivityTableQuery = getSQLString(
      "admin/delete-activities-table.sql",
    );
    await db.query(deleteActivityTableQuery);

    res.status(200).json({
      message: "Deleted activities table.",
    });
  },
);

app.post(
  "/admin/create_channels_table",
  async (req: Request, res: Response) => {
    const createChannelTableQuery = getSQLString(
      "admin/create-channels-table.sql",
    );

    await db.query(createChannelTableQuery);

    res.status(201).json({
      message: "Created channels table.",
    });
  },
);

app.delete(
  "/admin/delete_channels_table",
  async (req: Request, res: Response) => {
    const deleteChannelTableQuery = getSQLString(
      "admin/delete-channels-table.sql",
    );
    await db.query(deleteChannelTableQuery);

    res.status(200).json({
      message: "Deleted channels table.",
    });
  },
);

app.post(
  "/admin/create_subscriptions_table",
  async (req: Request, res: Response) => {
    const createSubscriptionTableQuery = getSQLString(
      "admin/create-subscriptions-table.sql",
    );

    await db.query(createSubscriptionTableQuery);

    res.status(201).json({
      message: "Created subscriptions table.",
    });
  },
);

app.delete(
  "/admin/delete_subscriptions_table",
  async (req: Request, res: Response) => {
    const deleteSubscriptionTableQuery = getSQLString(
      "admin/delete-subscriptions-table.sql",
    );
    await db.query(deleteSubscriptionTableQuery);

    res.status(200).json({
      message: "Deleted subscription table.",
    });
  },
);

app.get("/subscriptions/all", async (req: Request, res: Response) => {
  const getAllSubscriptionsQuery = getSQLString(
    "subscription/get-all-subscriptions.sql",
  );

  try {
    const subscriptions = await db.query(getAllSubscriptionsQuery);
    return res.status(200).json(subscriptions.rows[0].json_agg || []);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/subscription/:id", async (req: Request, res: Response) => {
  const subscriptionId = req.params.id;
  const getSubscriptionByIdQuery = getSQLString(
    "subscription/get-subscription-by-id.sql",
  );

  if (!subscriptionId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Subscription ID required" });
  }

  try {
    const subscription = await db.query(getSubscriptionByIdQuery, [
      subscriptionId,
    ]);
    if (subscription.rows.length === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    return res.status(200).json(subscription.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/channels/all", async (req: Request, res: Response) => {
  const getAllChannelsQuery = getSQLString("channel/get-all-channels.sql");

  try {
    const channels = await db.query(getAllChannelsQuery);
    return res.status(200).json(channels.rows[0].json_agg || []);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/channel/:id", async (req: Request, res: Response) => {
  const channelId = req.params.id;
  const getChannelByIdQuery = getSQLString("channel/get-channel-by-id.sql");

  if (!channelId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Channel ID required" });
  }

  try {
    const channel = await db.query(getChannelByIdQuery, [channelId]);
    if (channel.rows.length === 0) {
      return res.status(404).json({ message: "Channel not found" });
    }
    return res.status(200).json(channel.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/activities", async (req: Request, res: Response) => {
  const getAllActivitiesQuery = getSQLString("activity/get-all-activities.sql");

  try {
    const activities = await db.query(getAllActivitiesQuery);
    return res.status(200).json(activities.rows[0].json_agg || []);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/activities/:id", async (req: Request, res: Response) => {
  const activityId = req.params.id;
  const getActivityByIdQuery = getSQLString("activity/get-activity-by-id.sql");

  if (!activityId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Activity ID required" });
  }

  try {
    const activity = await db.query(getActivityByIdQuery, [activityId]);
    if (activity.rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }
    return res.status(200).json(activity.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/activities/:id/dismiss", async (req: Request, res: Response) => {
  const activityId = req.params.id;
  const updateActivityDismissedQuery = getSQLString(
    "activity/update-activity-dismissed.sql",
  );

  if (!activityId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Activity ID required" });
  }

  try {
    const activity = await db.query(updateActivityDismissedQuery, [
      true,
      activityId,
    ]);
    if (activity.rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }
    return res.status(200).json(activity.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/documents", async (req: Request, res: Response) => {
  const getAllDocumentsQuery = getSQLString("document/get-all-documents.sql");
  const { status } = req.query;

  try {
    const documents = await db.query(getAllDocumentsQuery);
    let result = documents.rows[0].json_agg || [];

    // Filter by status if query parameter is provided
    if (status && typeof status === "string") {
      result = result.filter(
        (doc: any) =>
          doc.submission?.status?.toLowerCase() === status.toLowerCase(),
      );
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500);
  }
});

app.post("/documents", async (req: Request, res: Response) => {
  const { title, external_link } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Bad Request - title is required" });
  }

  if (!external_link || !external_link.trim()) {
    return res
      .status(400)
      .json({ message: "Bad Request - external_link is required" });
  }

  const insertDocumentQuery = getSQLString("document/insert-document.sql");

  try {
    const document = await db.query(insertDocumentQuery, [
      title,
      external_link,
    ]);

    // Create a channel for this document
    const insertChannelQuery = getSQLString("channel/insert-channel.sql");
    const channelName = `document-${document.rows[0].document_id}`;
    const channelDescription = `Discussion channel for: ${title}`;
    await db.query(insertChannelQuery, [channelName, channelDescription]);

    // Log activity for document creation
    const insertActivityQuery = getSQLString("activity/insert-activity.sql");
    const activityDetails = {
      document_id: document.rows[0].document_id,
      title: title,
    };
    await db.query(insertActivityQuery, [
      "admin@example.com", // user_email (using fake data for now)
      "created", // action
      "document", // entity_type
      document.rows[0].document_id, // entity_id
      JSON.stringify(activityDetails), // details
    ]);

    return res.status(201).json(document.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/documents/:id", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const { title, external_link } = req.body;

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Bad Request - title is required" });
  }

  if (!external_link || !external_link.trim()) {
    return res
      .status(400)
      .json({ message: "Bad Request - external_link is required" });
  }

  const updateDocumentQuery = getSQLString("document/update-document.sql");

  try {
    const document = await db.query(updateDocumentQuery, [
      title,
      external_link,
      documentId,
    ]);

    if (document.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Log activity for document update
    const insertActivityQuery = getSQLString("activity/insert-activity.sql");
    const activityDetails = {
      document_id: documentId,
      title: title,
    };
    await db.query(insertActivityQuery, [
      "admin@example.com", // user_email (using fake data for now)
      "updated", // action
      "document", // entity_type
      documentId, // entity_id
      JSON.stringify(activityDetails), // details
    ]);

    return res.status(200).json(document.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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

    // Log activity
    const insertActivityQuery = getSQLString("activity/insert-activity.sql");
    const activityDetails = {
      document_id: documentId,
      text_preview: text.substring(0, 100),
    };
    await db.query(insertActivityQuery, [
      author, // user_email (using fake data for now)
      "created", // action
      "comment", // entity_type
      comment.rows[0].comment_id, // entity_id
      JSON.stringify(activityDetails), // details
    ]);

    // Create subscription for the commenter to the document's channel
    const channelName = `document-${documentId}`;
    const getChannelByNameQuery = getSQLString(
      "channel/get-channel-by-name.sql",
    );
    const channelResult = await db.query(getChannelByNameQuery, [channelName]);

    if (channelResult.rows.length > 0) {
      const channelId = channelResult.rows[0].channel_id;
      const upsertSubscriptionQuery = getSQLString(
        "subscription/upsert-subscription.sql",
      );

      await db.query(upsertSubscriptionQuery, [author, channelId, "active"]);
    }

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

app.post("/documents/:id/submission", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const { submitted_by, status } = req.body;
  const insertSubmissionQuery = getSQLString(
    "submission/insert-submission.sql",
  );

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  if (!submitted_by || !submitted_by.trim()) {
    return res
      .status(400)
      .json({ message: "Bad Request - submitted_by is required" });
  }

  try {
    // Get document details first
    const getDocumentQuery = getSQLString("document/get-document-by-id.sql");
    const documentResult = await db.query(getDocumentQuery, [documentId]);

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = documentResult.rows[0];

    const submission = await db.query(insertSubmissionQuery, [
      documentId,
      submitted_by,
      status || null,
    ]);

    // Create a page for this document with published=false
    const upsertPageQuery = getSQLString("page/upsert-page.sql");
    const slug = `document-${documentId}`;
    const pageContent = `Document: ${document.title}\n\nExternal Link: ${document.external_link}`;

    await db.query(upsertPageQuery, [
      document.title,
      pageContent,
      slug,
      false, // published = false when submission is created
    ]);

    // Log activity for submission creation
    const insertActivityQuery = getSQLString("activity/insert-activity.sql");
    const activityDetails = {
      document_id: documentId,
      status: status || "pending",
      submitted_by: submitted_by,
    };
    await db.query(insertActivityQuery, [
      submitted_by, // user_email
      "created", // action
      "submission", // entity_type
      submission.rows[0].submission_id, // entity_id
      JSON.stringify(activityDetails), // details
    ]);

    return res.status(201).json(submission.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/documents/:id/submission", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const getSubmissionQuery = getSQLString("submission/get-submission.sql");

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  try {
    const submission = await db.query(getSubmissionQuery, [documentId]);

    if (submission.rows.length === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    return res.status(200).json(submission.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/documents/:id/submission", async (req: Request, res: Response) => {
  const documentId = req.params.id;
  const { status, reviewed_by, reviewed_at } = req.body;
  const updateSubmissionQuery = getSQLString(
    "submission/update-submission.sql",
  );

  if (!documentId) {
    return res
      .status(400)
      .json({ message: "Bad Request - Document ID required" });
  }

  try {
    // Get document details first
    const getDocumentQuery = getSQLString("document/get-document-by-id.sql");
    const documentResult = await db.query(getDocumentQuery, [documentId]);

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const document = documentResult.rows[0];

    const submission = await db.query(updateSubmissionQuery, [
      status || null,
      reviewed_by || null,
      reviewed_at || null,
      documentId,
    ]);

    if (submission.rows.length === 0) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Upsert to page table based on submission status
    const upsertPageQuery = getSQLString("page/upsert-page.sql");
    const slug = `document-${documentId}`;
    const pageContent = `Document: ${document.title}\n\nExternal Link: ${document.external_link}`;

    // Determine if page should be published based on status
    const isPublished = status === "published";

    await db.query(upsertPageQuery, [
      document.title,
      pageContent,
      slug,
      isPublished,
    ]);

    // Log activity for status change
    if (status) {
      const insertActivityQuery = getSQLString("activity/insert-activity.sql");
      const activityDetails = {
        document_id: documentId,
        status: status,
        reviewed_by: reviewed_by || null,
      };
      await db.query(insertActivityQuery, [
        reviewed_by || "system@example.com", // user_email
        "updated", // action
        "submission", // entity_type
        submission.rows[0].submission_id, // entity_id
        JSON.stringify(activityDetails), // details
      ]);
    }

    return res.status(200).json(submission.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

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
        return [document.title, document.external_link, document.date];
      });

      const bulkInsertDocuments = format(
        bulkInsertDocumentsQuery,
        documentsAsList,
      );

      const result = await db.query(bulkInsertDocuments);

      // Create channels for each inserted document
      const insertChannelQuery = getSQLString("channel/insert-channel.sql");
      for (const document of result.rows) {
        const channelName = `document-${document.document_id}`;
        const channelDescription = `Discussion channel for: ${document.title}`;
        await db.query(insertChannelQuery, [channelName, channelDescription]);
      }

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

// Submissions Table Endpoints
app.post(
  "/admin/create_submissions_table",
  async (req: Request, res: Response) => {
    const createSubmissionsTableQuery = getSQLString(
      "admin/create-submissions-table.sql",
    );
    await db.query(createSubmissionsTableQuery);

    res.status(201).json({
      message: "Created submissions table.",
    });
  },
);

app.delete(
  "/admin/delete_submissions_table",
  async (req: Request, res: Response) => {
    const deleteSubmissionsTableQuery = getSQLString(
      "admin/delete-submissions-table.sql",
    );
    await db.query(deleteSubmissionsTableQuery);

    res.status(200).json({
      message: "Deleted submissions table.",
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
  "/admin/link_all_comments_to_document_1",
  async (req: Request, res: Response) => {
    const linkAllCommentsToDocument1Query = getSQLString(
      "admin/link-all-comments-to-document-1.sql",
    );
    await db.query(linkAllCommentsToDocument1Query);

    res.status(201).json({
      message: "Linked all comments to document 1.",
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

// Pages Admin Endpoints
app.post("/admin/create_pages_table", async (req: Request, res: Response) => {
  const createPagesTableQuery = getSQLString("admin/create-pages-table.sql");

  await db.query(createPagesTableQuery);

  res.status(201).json({
    message: "Created pages table.",
  });
});

app.delete("/admin/delete_pages_table", async (req: Request, res: Response) => {
  const deletePagesTableQuery = getSQLString("admin/delete-pages-table.sql");
  await db.query(deletePagesTableQuery);

  res.status(200).json({
    message: "Deleted pages table.",
  });
});

// Pages Endpoints
app.get("/pages", async (req: Request, res: Response) => {
  const getAllPagesQuery = getSQLString("page/get-all-pages.sql");

  try {
    const pages = await db.query(getAllPagesQuery);
    return res.status(200).json(pages.rows[0].json_agg || []);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/pages/:id", async (req: Request, res: Response) => {
  const pageId = req.params.id;
  const getPageByIdQuery = getSQLString("page/get-page-by-id.sql");

  if (!pageId) {
    return res.status(400).json({ message: "Bad Request - Page ID required" });
  }

  try {
    const page = await db.query(getPageByIdQuery, [pageId]);

    if (page.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json(page.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/pages/:id", async (req: Request, res: Response) => {
  const pageId = req.params.id;
  const { title, content, slug, published } = req.body;

  if (!pageId) {
    return res.status(400).json({ message: "Bad Request - Page ID required" });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Bad Request - title is required" });
  }

  if (!content || !content.trim()) {
    return res
      .status(400)
      .json({ message: "Bad Request - content is required" });
  }

  if (!slug || !slug.trim()) {
    return res.status(400).json({ message: "Bad Request - slug is required" });
  }

  const updatePageQuery = getSQLString("page/update-page.sql");

  try {
    const page = await db.query(updatePageQuery, [
      title,
      content,
      slug,
      published !== undefined ? published : false,
      pageId,
    ]);

    if (page.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json(page.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Page with this slug already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/pages/:id", async (req: Request, res: Response) => {
  const pageId = req.params.id;
  const deletePageQuery = getSQLString("page/delete-page.sql");

  if (!pageId) {
    return res.status(400).json({ message: "Bad Request - Page ID required" });
  }

  try {
    const page = await db.query(deletePageQuery, [pageId]);

    if (page.rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json({
      message: "Page deleted successfully",
      page: page.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
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
