SELECT json_agg(
    json_build_object(
        'document_id', d.document_id,
        'title', d.title,
        'external_link', d.external_link,
        'created_at', d.created_at,
        'submission', CASE 
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
        END
    ) ORDER BY d.created_at DESC
)
FROM documents d
LEFT JOIN submissions s ON d.document_id = s.document_id
