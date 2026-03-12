UPDATE documents
SET title = $1, external_link = $2
WHERE document_id = $3
RETURNING *;
