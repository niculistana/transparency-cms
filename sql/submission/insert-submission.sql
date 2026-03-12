INSERT INTO submissions (document_id, submitted_by, status)
VALUES ($1, $2, COALESCE($3, 'pending'))
RETURNING *;
