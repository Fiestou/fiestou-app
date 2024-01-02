<?php

namespace App\Models;

use App\Models\BaseModel;

class ContentRel extends BaseModel
{
    protected $table = 'content_rel';
    protected $fillable = [
        'id',
        'main_content_id',
        'secondary_content_id',
        'order',
        'type'
    ];
}








