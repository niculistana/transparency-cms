UPDATE comments
SET flagged = $1
WHERE comment_id = $2
RETURNING *;