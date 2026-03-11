INSERT INTO comments(text, author, likes, image)
VALUES($1, $2, $3, $4)
RETURNING *
