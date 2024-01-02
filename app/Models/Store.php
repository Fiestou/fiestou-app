<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Store extends BaseModel
{
    protected $table = 'store';
    protected $fillable = [
        "id",
        "user",
        "title",
        "slug",
        "companyName",
        "document",
        "description",
        "cover",
        "profile",
        "openClose",
        "segment",
        "hasDelivery",
        "meta",
        "zipCode",
        "street",
        "number",
        "neighborhood",
        "complement",
        "city",
        "state",
        "country",
        "status",
        "created_at",
        "updated_at"
    ];
}
