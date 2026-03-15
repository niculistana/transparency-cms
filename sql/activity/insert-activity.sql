INSERT INTO activities(user_email, action, entity_type, entity_id, details)
VALUES($1, $2, $3, $4, $5)
RETURNING *
