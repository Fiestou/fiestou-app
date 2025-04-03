CREATE PROCEDURE GetAllGroupDescendants(
    IN group_id BIGINT UNSIGNED,
    IN is_active BOOLEAN
)
BEGIN
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_group_hierarchy (
        id BIGINT UNSIGNED,
        name VARCHAR(255),
        description TEXT,
        parent_id BIGINT UNSIGNED,
        active BOOLEAN
    );

    INSERT INTO temp_group_hierarchy
    SELECT id, name, description, parent_id, active
    FROM `group`
    WHERE id = group_id;

    DECLARE rows_affected INT DEFAULT 1;

    WHILE rows_affected > 0 DO
        INSERT INTO temp_group_hierarchy
        SELECT g.id, g.name, g.description, g.parent_id, g.active
        FROM `group` g
        INNER JOIN temp_group_hierarchy gh ON g.parent_id = gh.id
        WHERE NOT EXISTS (
            SELECT 1 FROM temp_group_hierarchy th WHERE th.id = g.id
        )
        AND (is_active IS NULL OR g.active = is_active);

        SET rows_affected = ROW_COUNT();
    END WHILE;

    SELECT * FROM temp_group_hierarchy WHERE id != group_id;
    
    DROP TEMPORARY TABLE temp_group_hierarchy;
END