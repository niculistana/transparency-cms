INSERT INTO documents (title, external_link)
VALUES ($1, $2)
RETURNING *;
