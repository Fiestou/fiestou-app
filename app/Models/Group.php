<?php

namespace App\Models;

use App\Models\BaseModel;

class Group extends BaseModel
{
    protected $table = 'group';
    protected $fillable = [
        'id',
        'name',
        'description',
        'parent_id',
        'active',
        'created_at',
        'updated_at',
    ];
}
