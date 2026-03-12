SELECT 
    d.document_id,
    d.external_link,
    d.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'comment_id', c.comment_id,
                'text', c.text,
                'author', c.author,
                'created_at', c.created_at,
                'likes', c.likes,
                'image', c.image,
                'flagged', c.flagged
            ) ORDER BY c.created_at DESC
        ) FILTER (WHERE c.comment_id IS NOT NULL),
        '[]'::json
    ) as comments
FROM documents d
LEFT JOIN document_comments dc ON d.document_id = dc.document_id
LEFT JOIN comments c ON dc.comment_id = c.comment_id
WHERE d.document_id = $1
GROUP BY d.document_id, d.external_link, d.created_at