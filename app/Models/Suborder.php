<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\Order;
use Illuminate\Support\Str;
use DB;

class Suborder extends BaseModel
{
    protected $table = 'suborder';
    protected $fillable = [
        "id",
        "order",
        "store",
        "user",
        "deliveryStatus",
        "deliverySchedule",
        "total",
        "listItems",
        "status",
        "created_at",
        "updated_at"
    ];

    public function parent(){
        return $this->hasOne(Order::class, 'id', 'order');
    }
}
