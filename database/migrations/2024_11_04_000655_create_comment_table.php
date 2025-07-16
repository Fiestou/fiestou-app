<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCommentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('comment')) return;

        Schema::create('comment', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user');
            $table->unsignedBigInteger('parent')->nullable();
            $table->unsignedBigInteger('product');
            $table->text('text');
            $table->tinyInteger('rate');
            $table->tinyInteger('status')->nullable();
            $table->datetime('created_at');
            $table->datetime('updated_at');

            // Definir a chave única
            $table->unique('id');

            // Definir as chaves estrangeiras
            $table->foreign('user')->references('id')->on('user')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('parent')->references('id')->on('comment')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('product')->references('id')->on('product')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comment');
    }
}
