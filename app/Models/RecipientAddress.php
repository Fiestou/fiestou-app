<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipientAddress extends Model
{
    use HasFactory;
    protected $fillable = [
        'recipient_id', 'type', 'partner_document', 'street', 'complementary',
        'street_number', 'neighborhood', 'city', 'state', 'zip_code', 'reference_point'
    ];
    public function recipient() { return $this->belongsTo(Recipient::class); }
}
