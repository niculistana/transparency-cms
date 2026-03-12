-- Gets all comments wether they are linked or not; useful for comment moderation
SELECT c.*,
FROM comments c
INNER JOIN document_comments dc ON c.comment_id = dc.comment_id
WHERE c.document_id = $1
ORDER BY c.created_at DESC