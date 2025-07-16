<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipientConfig extends Model
{
    use HasFactory;
    protected $fillable = [
        'recipient_id', 'transfer_enabled', 'transfer_interval', 'transfer_day',
        'anticipation_enabled', 'anticipation_type', 'anticipation_volume_percentage',
        'anticipation_days', 'anticipation_delay'
    ];
    public function recipient() { return $this->belongsTo(Recipient::class); }
}

