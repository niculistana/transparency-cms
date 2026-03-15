INSERT INTO document_comments (document_id, comment_id)
SELECT 1, comment_id FROM comments
ON CONFLICT (document_id, comment_id) DO NOTHING
