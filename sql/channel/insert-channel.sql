INSERT INTO channels (name, description)
VALUES ($1, $2)
RETURNING *
