<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\Customer;
use Illuminate\Support\Str;
use DB;

class Customer extends BaseModel
{
    public $log = [];
    protected $table = 'customer';
    protected $fillable = [
        "id",
        "user",
        "store",
        "status",
        "created_at",
        "updated_at"
    ];
}
