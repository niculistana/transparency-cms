UPDATE comments
SET text = $1
WHERE comment_id = $2
RETURNING *