UPDATE submissions
SET status = COALESCE($1, status),
    reviewed_by = COALESCE($2, reviewed_by),
    reviewed_at = COALESCE($3, reviewed_at)
WHERE document_id = $4
RETURNING *;
