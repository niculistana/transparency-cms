INSERT INTO subscriptions (user_email, channel_id, status)
VALUES ($1, $2, $3)
RETURNING *
