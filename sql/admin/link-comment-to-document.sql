INSERT INTO document_comments (document_id, comment_id)
VALUES ($1, $2)
RETURNING *
ON CONFLICT (document_id, comment_id) DO NOTHING
