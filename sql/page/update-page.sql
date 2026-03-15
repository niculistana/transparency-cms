UPDATE pages
SET title = $1, content = $2, slug = $3, published = $4, updated_at = NOW()
WHERE page_id = $5
RETURNING *;
