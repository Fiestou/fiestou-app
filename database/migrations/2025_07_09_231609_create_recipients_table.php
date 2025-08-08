<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRecipientsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('recipients', function (Blueprint $table) {
            $table->id();
            $table->text('partner_id')->nullable();
            $table->string('code')->nullable();
            $table->enum('type_enum', ['PF', 'PJ']);
            $table->string('email');
            $table->string('document');
            $table->string('type');
            $table->string('company_name')->nullable();
            $table->string('trading_name')->nullable();
            $table->integer('annual_revenue')->nullable();
            $table->string('name');
            $table->date('birth_date')->nullable();
            $table->integer('monthly_income')->nullable();
            $table->string('professional_occupation')->nullable();
            $table->unsignedBigInteger('store_id');
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
        Schema::dropIfExists('recipients');
    }
}
