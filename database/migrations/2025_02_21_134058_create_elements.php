<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateElements extends Migration
{
    public function up()
    {
        Schema::create('elements', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->string('icon', 40)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('active')->default(true);

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('elements')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('elements');
    }
}
