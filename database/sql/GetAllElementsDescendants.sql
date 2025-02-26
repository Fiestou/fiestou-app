CREATE PROCEDURE `GetElementDescendants`(
    IN parentId BIGINT UNSIGNED,
    IN isActive TINYINT(1)
)
BEGIN
    WITH RECURSIVE element_tree AS (
		SELECT
			er.child_id AS element_id,
			er.parent_id,
			1 AS depth
		FROM elements_rel er
		WHERE er.parent_id = 1

		UNION ALL

		SELECT
			er.child_id,
			er.parent_id,
			et.depth + 1
		FROM elements_rel er
		INNER JOIN element_tree et ON er.parent_id = et.element_id
	)

	SELECT
		e.id,
		e.name,
		e.icon,
		e.description,
		e.active,
		et.depth AS generation_level,
		et.parent_id AS immediate_parent_id
	FROM element_tree et
	INNER JOIN elements e ON e.id = et.element_id
	ORDER BY et.depth, e.name;
END
