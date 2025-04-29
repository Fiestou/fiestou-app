<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddGroupAndElementRelatedToElementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('elements', function (Blueprint $table) {
            // Adicionando o relacionamento com 'group_id' (com a tabela groups) e tornando 'nullable' pois quando não é nullable os registros que exitem acabam quebrando a migration pois não existe relacionamento anterior
            $table->unsignedBigInteger('group_id')->nullable(); // Tornando 'nullable'

            // Adicionando o relacionamento recursivo 'element_related_id' (relacionamento com a própria tabela)
            $table->unsignedBigInteger('element_related_id')->nullable();
            
            // Adicionando as chaves estrangeiras
            $table->foreign('group_id')->references('id')->on('group')->onDelete('cascade');
            $table->foreign('element_related_id')->references('id')->on('elements')->onDelete('cascade'); // Relacionamento recursivo com a tabela elements
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('elements', function (Blueprint $table) {
            // Remover as chaves estrangeiras e as colunas em caso de rollback
            $table->dropForeign(['group_id']);
            $table->dropForeign(['element_related_id']);
            $table->dropColumn('group_id');
            $table->dropColumn('element_related_id');
        });
    }
}
