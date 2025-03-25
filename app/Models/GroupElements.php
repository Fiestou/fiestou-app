<?php

namespace App\Models;

use App\Models\BaseModel;

class GroupElements extends BaseModel
{
    protected $table = 'group_elements';
    protected $fillable = [
        'id',
        'id_group',
        'id_elements',
        'created_at',
        'updated_at',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'id_group');
    }

    public function element()
    {
        return $this->belongsTo(Elements::class, 'id_elements');
    }
}
