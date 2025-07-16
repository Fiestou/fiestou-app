<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMediaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('media')) return;

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('application_id')->default(0);
            $table->text('title');
            $table->text('slug');
            $table->text('description');
            $table->text('file_name');
            $table->text('path');
            $table->string('base_url', 280)->nullable();
            $table->text('permanent_url');
            $table->string('extension', 10)->default('');
            $table->longText('details');
            $table->longText('permissions');
            $table->string('type', 10)->default('0');
            $table->datetime('created_at');
            $table->datetime('updated_at');
            $table->float('file_size')->nullable();

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
        Schema::dropIfExists('media');
    }
}
