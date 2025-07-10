<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Withdraw extends BaseModel
{
    protected $table = 'withdraw';
    protected $fillable = [
        "id",
        "store",
        "code",
        "bankAccount",
        "value",
        "metadata",
        'split_payment',
        "status",
        "created_at",
        "updated_at"
    ];
}
