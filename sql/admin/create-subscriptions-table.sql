CREATE TABLE subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    channel_id INTEGER NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    UNIQUE(user_email, channel_id)
)
