<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('order')) return;

        Schema::create('order', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user');
            $table->unsignedBigInteger('store')->nullable();
            $table->text('hash')->nullable();
            $table->string('deliveryStatus', 50)->nullable();
            $table->string('deliverySchedule', 50)->nullable();
            $table->string('deliveryTo', 50)->nullable();
            $table->float('deliveryPrice')->nullable();
            $table->float('total')->nullable();
            $table->string('platformCommission', 60)->nullable();
            $table->longText('listItems')->nullable();
            $table->longText('deliveryAddress')->nullable();
            $table->longText('metadata')->nullable();
            $table->tinyInteger('status')->nullable();
            $table->datetime('created_at')->nullable();
            $table->datetime('updated_at')->nullable();

            // Definir a chave única
            $table->unique('id');

            // Definir as chaves estrangeiras
            $table->foreign('user')->references('id')->on('user')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('store')->references('id')->on('store')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order');
    }
}
