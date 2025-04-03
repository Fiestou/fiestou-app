<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStoreTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('store')) return;

        Schema::create('store', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user');
            $table->string('title', 140)->default('');
            $table->string('slug', 140)->default('');
            $table->string('companyName', 140)->nullable();
            $table->string('document', 60)->default('');
            $table->text('description')->nullable();
            $table->integer('cover')->nullable();
            $table->integer('profile')->nullable();
            $table->string('segment', 60)->nullable();
            $table->integer('hasDelivery')->nullable();
            $table->longText('metadata')->nullable();
            $table->longText('openClose')->charset('utf8mb4')->collation('utf8mb4_bin')->nullable();
            $table->string('zipCode', 50)->nullable();
            $table->string('street', 140)->nullable();
            $table->string('number', 10)->nullable();
            $table->string('neighborhood', 140)->nullable();
            $table->string('complement', 140)->nullable();
            $table->string('city', 140)->nullable();
            $table->string('state', 4)->nullable();
            $table->string('country', 50)->nullable();
            $table->tinyInteger('status')->nullable();
            $table->datetime('created_at')->nullable();
            $table->datetime('updated_at')->nullable();

            // Definir a chave única
            $table->unique('id');

            // Definir a chave estrangeira
            $table->foreign('user')->references('id')->on('user')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('store');
    }
}
