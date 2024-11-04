<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContentRelTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('content_rel')) return;

        Schema::create('content_rel', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('main_content_id');
            $table->unsignedBigInteger('secondary_content_id');
            $table->integer('order')->nullable();
            $table->string('type', 140);
            $table->datetime('created_at');
            $table->datetime('updated_at');

            // Definir a chave única
            $table->unique('id');

            // Adicionar chaves estrangeiras (caso as relações sejam necessárias)
            $table->foreign('main_content_id')->references('id')->on('content')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('secondary_content_id')->references('id')->on('content')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('content_rel');
    }
}
