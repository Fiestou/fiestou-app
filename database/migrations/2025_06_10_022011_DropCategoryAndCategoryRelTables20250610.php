<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropCategoryAndCategoryRelTables20250610 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Remover a foreign key de category_rel antes de dropar as tabelas
        Schema::table('category_rel', function (Blueprint $table) {
            $table->dropForeign('FK_rel_category');
        });

        Schema::dropIfExists('category_rel');
        Schema::dropIfExists('category');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Você pode recriar as tabelas aqui, se necessário
        Schema::create('category', function (Blueprint $table) {
            $table->id();
            // Adicione os campos necessários aqui
            $table->timestamps();
        });

        Schema::create('category_rel', function (Blueprint $table) {
            $table->id();
            // Adicione os campos necessários aqui
            $table->timestamps();
        });
    }
}