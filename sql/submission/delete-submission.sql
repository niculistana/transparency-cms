DELETE FROM submissions
WHERE submission_id = $1
RETURNING *;
