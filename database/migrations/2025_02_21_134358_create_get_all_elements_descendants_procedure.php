<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CreateGetAllElementsDescendantsProcedure extends Migration
{
    public function up()
    {
        $sqlFile = database_path('sql\GetAllElementsDescendants.sql');

        if (!File::exists($sqlFile)) {
            throw new \Exception("Arquivo SQL não encontrado: {$sqlFile}");
        }

        $procedure = File::get($sqlFile);

        DB::statement("DROP PROCEDURE IF EXISTS GetAllGroupDescendants");

        DB::statement($procedure);
    }

    public function down()
    {
        DB::statement("DROP PROCEDURE IF EXISTS GetAllElementsDescendants");
    }
}
