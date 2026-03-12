INSERT INTO document_comments (document_id, comment_id)
SELECT 25, comment_id FROM comments
ON CONFLICT (document_id, comment_id) DO NOTHING
