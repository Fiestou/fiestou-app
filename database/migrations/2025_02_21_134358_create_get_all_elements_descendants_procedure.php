<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class CreateGetAllElementsDescendantsProcedure extends Migration
{
    public function up()
    {
        $procedure = "
            CREATE PROCEDURE GetAllElementsDescendants(
                IN element_id BIGINT UNSIGNED,
                IN is_active BOOLEAN
            )
            BEGIN
                WITH RECURSIVE element_hierarchy AS (
                    SELECT id, name, icon, description, parent_id, active
                    FROM fiesto18_database.elements
                    WHERE id = element_id
                    AND (is_active IS NULL OR active = is_active)

                    UNION ALL

                    SELECT e.id, e.name, e.icon, e.description, e.parent_id, e.active
                    FROM fiesto18_database.elements e
                    INNER JOIN element_hierarchy eh ON e.parent_id = eh.id
                    WHERE is_active IS NULL OR e.active = is_active
                )

                SELECT * FROM element_hierarchy
                WHERE id != element_id;
            END
        ";

        // Remove qualquer procedure existente com o mesmo nome
        DB::statement("DROP PROCEDURE IF EXISTS GetAllElementsDescendants");

        // Cria a nova procedure
        DB::statement($procedure);
    }

    public function down()
    {
        // Remove a procedure ao fazer rollback
        DB::statement("DROP PROCEDURE IF EXISTS GetAllElementsDescendants");
    }
}
