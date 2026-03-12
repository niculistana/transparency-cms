WITH delete_links AS (
    DELETE FROM document_comments
    WHERE comment_id = $1
    RETURNING *
)
DELETE FROM comments
WHERE comment_id = $1
RETURNING *;