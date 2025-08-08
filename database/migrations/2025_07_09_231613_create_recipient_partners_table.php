<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipientPartnersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recipient_partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_id')->constrained('recipients')->onDelete('cascade');
            $table->string('name');
            $table->string('email');
            $table->string('document');
            $table->date('birth_date')->nullable();
            $table->integer('monthly_income')->nullable();
            $table->string('professional_occupation')->nullable();
            $table->boolean('self_declared_legal_representative')->default(false);
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
        Schema::dropIfExists('recipient_partners');
    }
}
