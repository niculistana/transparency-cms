WITH new_comment AS (
    INSERT INTO comments(text, author, likes, image)
    VALUES($1, $2, $3, $4)
    RETURNING comment_id, text, author, created_at, likes, image, flagged
),
link AS (
    INSERT INTO document_comments (document_id, comment_id)
    SELECT $5, comment_id FROM new_comment
    RETURNING *
)
SELECT nc.comment_id, nc.text, nc.author, nc.created_at, nc.likes, nc.image, nc.flagged 
FROM new_comment nc
