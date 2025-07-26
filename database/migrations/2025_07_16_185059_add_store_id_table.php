<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStoreIdTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('withdraw', function (Blueprint $table) {
            $table->boolean('is_split'); // corrigido aqui
        });

        Schema::table('recipients', function (Blueprint $table) {
            $table->unsignedBigInteger('store_id')->after('id');

            $table->foreign('store_id')
                ->references('id')
                ->on('stores')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('withdraw', function (Blueprint $table) {
            $table->dropColumn('is_split');
        });

        Schema::table('recipients', function (Blueprint $table) {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
    }
}
