SELECT 
    p.page_id,
    p.title,
    p.content,
    p.slug,
    p.published,
    p.created_at,
    p.updated_at
FROM pages p
WHERE p.page_id = $1;
