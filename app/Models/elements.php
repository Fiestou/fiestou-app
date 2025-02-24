<?php

namespace App\Models;

use App\Models\BaseModel;

class Elements extends BaseModel
{
    protected $table = 'elements';
    protected $fillable = [
        'id',
        'name',
        'description',
        'icon',
        'id_group',
        'active',
        'created_at',
        'updated_at',
    ];
}
