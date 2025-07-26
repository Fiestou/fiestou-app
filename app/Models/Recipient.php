<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipient extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id', 'partner_id', 'code', 'type_enum', 'email', 'document', 'type',
        'company_name', 'trading_name', 'annual_revenue', 'name', 'birth_date',
        'monthly_income', 'professional_occupation', 'store_id'
    ];

    public function partners() { return $this->hasMany(RecipientPartner::class); }
    public function addresses() { return $this->hasMany(RecipientAddress::class); }
    public function phones() { return $this->hasMany(RecipientPhone::class); }
    public function config() { return $this->hasOne(RecipientConfig::class); }
}

