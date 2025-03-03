<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

class ElementsRel extends BaseModel
{
    protected $table = 'elements_rel';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'parent_id',
        'child_id',
    ];
}
