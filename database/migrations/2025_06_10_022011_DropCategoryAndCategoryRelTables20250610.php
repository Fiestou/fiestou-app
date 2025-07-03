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
    }
}