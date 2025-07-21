<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('group', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }

    public function down(): void
    {
        Schema::table('group', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable();
    
            // Primeiro cria a coluna, depois a foreign key
            $table->foreign('parent_id')->references('id')->on('group')->onDelete('set null');
        });
    }
};