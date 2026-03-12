SELECT json_agg(d ORDER BY d.created_at)
FROM documents d
