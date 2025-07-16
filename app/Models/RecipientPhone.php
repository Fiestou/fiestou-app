<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipientPhone extends Model
{
    use HasFactory;
    protected $fillable = [
        'recipient_id', 'type', 'partner_document', 'area_code', 'number'
    ];
    public function recipient() { return $this->belongsTo(Recipient::class); }
}
