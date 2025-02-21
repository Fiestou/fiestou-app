<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGroup extends Migration
{
    public function up()
    {
        Schema::create('group', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->boolean('active')->default(true);

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('group')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('group');
    }
}
