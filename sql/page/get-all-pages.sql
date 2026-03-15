SELECT json_agg(
    json_build_object(
        'page_id', p.page_id,
        'title', p.title,
        'content', p.content,
        'slug', p.slug,
        'published', p.published,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) ORDER BY p.created_at DESC
) as json_agg
FROM pages p;
