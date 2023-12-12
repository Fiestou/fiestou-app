<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class CategoryRel extends BaseModel
{
    protected $table = 'category_rel';
    protected $fillable = [
        "id",
        "category",
        "product",
        "status",
        "created_at",
        "updated_at"
    ];
}
