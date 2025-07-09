<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipientPhonesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recipient_phones', function (Blueprint $table) {
            $table->id();
            $table->uuid('recipient_id');
            $table->enum('type', ['Recipient', 'Partner']);
            $table->string('partner_document')->nullable();
            $table->string('area_code');
            $table->string('number');
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
        Schema::dropIfExists('recipient_phones');
    }
}
