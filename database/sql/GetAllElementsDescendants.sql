CREATE PROCEDURE GetElementDescendants(
    IN parentId BIGINT UNSIGNED,
    IN isActive TINYINT(1)
)
BEGIN
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_element_tree (
        element_id BIGINT UNSIGNED,
        parent_id BIGINT UNSIGNED,
        depth INT
    );

    INSERT INTO temp_element_tree
    SELECT er.child_id, er.parent_id, 1
    FROM elements_rel er
    WHERE er.parent_id = parentId;

    DECLARE rows_affected INT DEFAULT 1;

    WHILE rows_affected > 0 DO
        INSERT INTO temp_element_tree
        SELECT er.child_id, er.parent_id, tet.depth + 1
        FROM elements_rel er
        INNER JOIN temp_element_tree tet ON er.parent_id = tet.element_id
        WHERE NOT EXISTS (
            SELECT 1 FROM temp_element_tree t WHERE t.element_id = er.child_id
        );
        
        SET rows_affected = ROW_COUNT();
    END WHILE;

    SELECT e.id, e.name, e.icon, e.description, e.active, tet.depth AS generation_level, tet.parent_id AS immediate_parent_id
    FROM temp_element_tree tet
    INNER JOIN elements e ON e.id = tet.element_id
    WHERE isActive IS NULL OR e.active = isActive
    ORDER BY tet.depth, e.name;

    DROP TEMPORARY TABLE temp_element_tree;
END