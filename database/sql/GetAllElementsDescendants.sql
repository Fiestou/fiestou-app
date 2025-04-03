CREATE PROCEDURE GetElementDescendants(
    IN parentId BIGINT UNSIGNED,
    IN isActive TINYINT(1)
)
BEGIN
    DECLARE rows_affected INT DEFAULT 0;

    DROP TEMPORARY TABLE IF EXISTS temp_element_tree;

    CREATE TEMPORARY TABLE temp_element_tree (
        element_id BIGINT UNSIGNED,
        parent_id BIGINT UNSIGNED,
        depth INT
    );

    INSERT INTO temp_element_tree
    SELECT er.child_id, er.parent_id, 1
    FROM elements_rel er
    WHERE er.parent_id = parentId;

    SELECT COUNT(*) INTO rows_affected FROM temp_element_tree;

    WHILE rows_affected > 0 DO
        INSERT INTO temp_element_tree
        SELECT er.child_id, er.parent_id, tet.depth + 1
        FROM elements_rel er
        INNER JOIN temp_element_tree tet ON er.parent_id = tet.element_id
        WHERE NOT EXISTS (
            SELECT 1 FROM temp_element_tree t WHERE t.element_id = er.child_id
        );

        SELECT ROW_COUNT() INTO rows_affected;
    END WHILE;

    SELECT e.id, e.name, e.icon, e.description, e.active, 
           tet.depth AS generation_level, tet.parent_id AS immediate_parent_id
    FROM temp_element_tree tet
    INNER JOIN elements e ON e.id = tet.element_id
    WHERE isActive IS NULL OR e.active = isActive
    ORDER BY tet.depth, e.name;

    DROP TEMPORARY TABLE IF EXISTS temp_element_tree;
END
