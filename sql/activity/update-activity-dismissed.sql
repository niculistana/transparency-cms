UPDATE activities
SET dismissed = $1
WHERE activity_id = $2
RETURNING *
