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
    ];

    public function elements()
    {
        return $this->hasMany(GroupElements::class, 'id_group');
    }
}
