<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStoreIdTable extends Migration
{
    public function up(): void
    {
        // Verifica se a coluna 'is_split' já existe antes de criar
        Schema::table('withdraw', function (Blueprint $table) {
            if (!Schema::hasColumn('withdraw', 'is_split')) {
                $table->boolean('is_split')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('withdraw', function (Blueprint $table) {
            if (Schema::hasColumn('withdraw', 'is_split')) {
                $table->dropColumn('is_split');
            }
        });
    }
}
