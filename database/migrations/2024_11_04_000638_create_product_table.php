<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('product')) return;

        Schema::create('product', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('store');
            $table->string('title', 140)->nullable();
            $table->string('slug', 140)->nullable();
            $table->string('sku', 50)->nullable();
            $table->string('code', 50)->nullable();
            $table->text('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->longText('gallery')->nullable();
            $table->float('price')->nullable();
            $table->float('priceSale')->nullable();
            $table->string('quantityType', 50)->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('availability')->nullable();
            $table->text('unavailable')->nullable();
            $table->float('weight')->nullable();
            $table->float('length')->nullable();
            $table->float('width')->nullable();
            $table->float('height')->nullable();
            $table->longText('attributes')->nullable();
            $table->text('tags')->nullable();
            $table->longText('category')->nullable();
            $table->string('color', 50)->nullable();
            $table->longText('combinations')->nullable();
            $table->string('suggestions', 50)->nullable();
            $table->string('fragility', 50)->nullable();
            $table->string('vehicle', 50)->nullable();
            $table->string('freeTax', 50)->nullable();
            $table->string('comercialType', 50)->nullable();
            $table->integer('schedulingPeriod')->nullable();
            $table->float('schedulingTax')->nullable();
            $table->string('schedulingDiscount', 50)->nullable();
            $table->string('assembly', 3)->nullable();
            $table->float('rate')->nullable();
            $table->tinyInteger('status')->nullable();
            $table->datetime('created_at')->nullable();
            $table->datetime('updated_at')->nullable();

            // Definir a chave única
            $table->unique('id');

            // Definir a chave estrangeira
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
        Schema::dropIfExists('product');
    }
}
