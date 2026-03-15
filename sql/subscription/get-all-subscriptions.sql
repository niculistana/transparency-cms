SELECT json_agg(s ORDER BY s.subscribed_at DESC) as json_agg
FROM subscriptions s
