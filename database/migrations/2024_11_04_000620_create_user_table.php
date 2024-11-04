<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('user')) return;

        Schema::create('user', function (Blueprint $table) {
            $table->id();
            $table->text('hash');
            $table->string('name', 60);
            $table->string('login', 60);
            $table->string('email', 140);
            $table->string('password', 60)->nullable();
            $table->string('remember', 60)->nullable();
            $table->longText('details')->nullable();
            $table->string('type', 10);
            $table->string('person', 10)->nullable();
            $table->tinyInteger('status');
            $table->timestamps();
            $table->date('date')->nullable();
            $table->unique('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user');
    }
}
