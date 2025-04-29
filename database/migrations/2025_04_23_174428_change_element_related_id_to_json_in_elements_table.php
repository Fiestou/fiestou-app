<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangeElementRelatedIdToJsonInElementsTable extends Migration
{
    public function up()
    {
        Schema::table('elements', function (Blueprint $table) {
            $table->dropForeign(['element_related_id']);
            $table->dropColumn('element_related_id');
        });

        Schema::table('elements', function (Blueprint $table) {
            $table->json('element_related_id')->nullable();
        });
    }

    public function down()
    {
        Schema::table('elements', function (Blueprint $table) {
            $table->dropColumn('element_related_id');
        });

        Schema::table('elements', function (Blueprint $table) {
            $table->unsignedBigInteger('element_related_id')->nullable();
            $table->foreign('element_related_id')->references('id')->on('elements')->onDelete('cascade');
        });
    }
}
