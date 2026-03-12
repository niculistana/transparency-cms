WITH new_comment AS (
    INSERT INTO comments(text, author, likes, image)
    VALUES($1, $2, $3, $4)
    RETURNING *
),
link AS (
    INSERT INTO document_comments (document_id, comment_id)
    SELECT $5, comment_id FROM new_comment
    RETURNING *
)
SELECT nc.* FROM new_comment nc
