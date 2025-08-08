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
            $table->foreignId('recipient_id')->constrained('recipients')->onDelete('cascade');
            $table->enum('type', ['Recipient', 'Partner']);
            $table->string('partner_document')->nullable();
            $table->string('area_code')->nullable();
            $table->string('number')->nullable();
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
        Schema::dropIfExists('recipient_phones');
    }
}
