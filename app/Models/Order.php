<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Order extends BaseModel
{
    protected $table = 'order';
    protected $fillable = [
        "id",
        "user",
        "hash",
        "deliveryStatus",
        "deliverySchedule",
        "deliveryAddress",
        "total",
        "platformCommission",
        "listItems",
        "metadata",
        "status",
        "created_at",
        "updated_at"
    ];
}
