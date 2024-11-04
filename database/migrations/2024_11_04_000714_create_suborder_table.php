<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSuborderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('suborder')) return;

        Schema::create('suborder', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user');
            $table->unsignedBigInteger('store');
            $table->unsignedBigInteger('order');
            $table->string('deliveryStatus', 50)->default('');
            $table->string('deliverySchedule', 50)->default('0');
            $table->string('deliveryTo', 50)->nullable();
            $table->float('total')->nullable();
            $table->float('paying')->nullable();
            $table->longText('listItems')->charset('utf8mb4')->collation('utf8mb4_bin');
            $table->tinyInteger('status')->nullable();
            $table->datetime('created_at')->nullable();
            $table->datetime('updated_at')->nullable();

            // Definir a chave única
            $table->unique('id');

            // Definir as chaves estrangeiras
            $table->foreign('user')->references('id')->on('user')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('store')->references('id')->on('store')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('order')->references('id')->on('order')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('suborder');
    }
}
