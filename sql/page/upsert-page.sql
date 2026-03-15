INSERT INTO pages (title, content, slug, published)
VALUES ($1, $2, $3, $4)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  published = EXCLUDED.published,
  updated_at = NOW()
RETURNING *;
