<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipientPartner extends Model
{
    use HasFactory;
    protected $fillable = [
        'recipient_id', 'name', 'email', 'document', 'birth_date',
        'monthly_income', 'professional_occupation', 'self_declared_legal_representative'
    ];
    public function recipient() { return $this->belongsTo(Recipient::class); }
}

