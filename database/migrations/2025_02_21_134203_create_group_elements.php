<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGroupElements extends Migration
{
    public function up()
    {
        Schema::create('group_elements', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('id_group');
            $table->unsignedBigInteger('id_elements');
            $table->timestamps();
            $table->foreign('id_group')
                  ->references('id')
                  ->on('group')
                  ->onDelete('cascade');

            $table->foreign('id_elements')
                  ->references('id')
                  ->on('elements')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('group_elements');
    }
}
