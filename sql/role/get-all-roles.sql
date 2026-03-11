SELECT json_agg(r ORDER BY r.created_at)
FROM roles r
