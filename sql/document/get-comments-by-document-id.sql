SELECT json_agg(
  json_build_object(
    'comment_id', c.comment_id,
    'text', c.text,
    'author', c.author,
    'likes', c.likes,
    'image', c.image,
    'created_at', c.created_at,
    'linked_at', dc.created_at
  ) ORDER BY c.created_at DESC
) as json_agg
FROM comments c
INNER JOIN document_comments dc ON c.comment_id = dc.comment_id
WHERE dc.document_id = $1
