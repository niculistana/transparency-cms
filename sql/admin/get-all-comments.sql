SELECT json_agg(c.* ORDER BY c.created_at) as json_agg
FROM COMMENTS c
