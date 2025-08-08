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
        $table->foreignId('recipient_id')->constrained('recipients')->onDelete('cascade');
        $table->enum('type', ['Recipient', 'Partner']);
        $table->string('partner_document')->nullable();
        $table->string('street')->nullable();
        $table->string('complementary')->nullable();
        $table->string('street_number')->nullable();
        $table->string('neighborhood')->nullable();
        $table->string('city')->nullable();
        $table->string('state')->nullable();
        $table->string('zip_code')->nullable();
        $table->string('reference_point')->nullable();
        $table->timestamps();
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
