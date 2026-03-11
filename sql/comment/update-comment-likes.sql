UPDATE comments
SET likes = $1
WHERE comment_id = $2
RETURNING *