<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipientAddressesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recipient_addresses', function (Blueprint $table) {
            $table->id();
            $table->uuid('recipient_id');
            $table->enum('type', ['Recipient', 'Partner']);
            $table->string('partner_document')->nullable();
            $table->string('street');
            $table->string('complementary')->nullable();
            $table->string('street_number');
            $table->string('neighborhood');
            $table->string('city');
            $table->string('state');
            $table->string('zip_code');
            $table->string('reference_point')->nullable();
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
        Schema::dropIfExists('recipient_addresses');
    }
}
