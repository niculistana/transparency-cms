SELECT json_agg(c ORDER BY c.created_at)
FROM channels c
