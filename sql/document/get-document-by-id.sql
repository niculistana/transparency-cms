SELECT 
    d.document_id,
    d.title,
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
    ) as comments,
    CASE 
        WHEN s.submission_id IS NOT NULL THEN
            json_build_object(
                'submission_id', s.submission_id,
                'document_id', s.document_id,
                'submitted_by', s.submitted_by,
                'submitted_at', s.submitted_at,
                'status', s.status,
                'reviewed_by', s.reviewed_by,
                'reviewed_at', s.reviewed_at
            )
        ELSE NULL
    END as submission
FROM documents d
LEFT JOIN document_comments dc ON d.document_id = dc.document_id
LEFT JOIN comments c ON dc.comment_id = c.comment_id
LEFT JOIN submissions s ON d.document_id = s.document_id
WHERE d.document_id = $1
GROUP BY d.document_id, d.external_link, d.created_at, s.submission_id, s.document_id, s.submitted_by, s.submitted_at, s.status, s.reviewed_by, s.reviewed_at