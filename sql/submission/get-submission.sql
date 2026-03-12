SELECT 
    submission_id,
    document_id,
    submitted_by,
    submitted_at,
    status,
    reviewed_by,
    reviewed_at
FROM submissions
WHERE document_id = $1;
