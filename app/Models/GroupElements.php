<?php

namespace App\Models;

use App\Models\BaseModel;

class Group extends BaseModel
{
    protected $table = 'group';
    protected $fillable = [
        'id',
        'id_group',
        'id_elements',
        'created_at',
        'updated_at',
    ];
}
