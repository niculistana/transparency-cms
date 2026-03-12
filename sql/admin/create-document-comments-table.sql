CREATE TABLE document_comments (
    document_id INTEGER NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    comment_id INTEGER NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (document_id, comment_id)
)