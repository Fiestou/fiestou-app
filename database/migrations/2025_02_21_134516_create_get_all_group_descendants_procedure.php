<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;


class CreateGetAllGroupDescendantsProcedure extends Migration
{
    public function up()
    {
        $procedure = "
            CREATE PROCEDURE GetAllGroupDescendants(
                IN group_id BIGINT UNSIGNED,
                IN is_active BOOLEAN
            )
            BEGIN
                WITH RECURSIVE group_hierarchy AS (
                    SELECT id, name, description, parent_id, active
                    FROM `group`
                    WHERE id = group_id
                    AND (is_active IS NULL OR active = is_active)

                    UNION ALL

                    SELECT g.id, g.name, g.description, g.parent_id, g.active
                    FROM `group` g
                    INNER JOIN group_hierarchy gh ON g.parent_id = gh.id
                    WHERE is_active IS NULL OR g.active = is_active
                )

                SELECT * FROM group_hierarchy
                WHERE id != group_id;
            END
        ";

        // Remove qualquer procedure existente com o mesmo nome
        DB::statement("DROP PROCEDURE IF EXISTS GetAllGroupDescendants");

        // Cria a nova procedure
        DB::statement($procedure);
    }

    public function down()
    {
        // Remove a procedure ao fazer rollback
        DB::statement("DROP PROCEDURE IF EXISTS GetAllGroupDescendants");
    }
}
