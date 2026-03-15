SELECT json_agg(a.* ORDER BY a.created_at DESC) as json_agg
FROM activities a
WHERE a.dismissed = FALSE
