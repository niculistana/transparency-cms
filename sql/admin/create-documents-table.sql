CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    external_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)