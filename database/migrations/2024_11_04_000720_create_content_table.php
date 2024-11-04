<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('content')) return;

        Schema::create('content', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('title', 240)->default('');
            $table->string('slug', 240)->default('');
            $table->longText('content')->nullable();
            $table->longText('details')->nullable();
            $table->tinyInteger('featured')->nullable();
            $table->integer('views')->nullable();
            $table->tinyInteger('trash')->default(0);
            $table->integer('order')->nullable();
            $table->string('type', 60);
            $table->tinyInteger('status')->default(0);
            $table->datetime('created_at');
            $table->datetime('updated_at');

            // Definir a chave única
            $table->unique('id');

            // Definir a chave estrangeira
            $table->foreign('user_id')->references('id')->on('user')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('content');
    }
}
