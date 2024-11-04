<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCategoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('category')) return;

        Schema::create('category', function (Blueprint $table) {
            $table->id();
            $table->integer('parent')->nullable();
            $table->longText('closest')->charset('utf8mb4')->collation('utf8mb4_bin')->nullable();
            $table->integer('order')->nullable();
            $table->string('title', 140)->nullable();
            $table->string('slug', 140)->nullable();
            $table->tinyInteger('feature')->nullable();
            $table->integer('image')->nullable();
            $table->text('text')->nullable();
            $table->tinyInteger('multiple')->nullable();
            $table->longText('metadata')->nullable();
            $table->tinyInteger('status')->default(0);
            $table->datetime('created_at')->nullable();
            $table->datetime('updated_at')->nullable();
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
        Schema::dropIfExists('category');
    }
}
