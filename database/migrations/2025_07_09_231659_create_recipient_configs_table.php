<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipientConfigsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recipient_configs', function (Blueprint $table) {
            $table->id();
            $table->uuid('recipient_id');
            $table->boolean('transfer_enabled')->default(false);
            $table->string('transfer_interval');
            $table->integer('transfer_day');
            $table->boolean('anticipation_enabled')->default(false);
            $table->enum('anticipation_type', ['full', '1025'])->nullable();
            $table->string('anticipation_volume_percentage')->nullable();
            $table->string('anticipation_days')->nullable();
            $table->string('anticipation_delay')->nullable();
            $table->timestamps();

            $table->foreign('recipient_id')->references('id')->on('recipients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('recipient_configs');
    }
}
