<?php

namespace App\Models;

use App\Models\BaseModel;

class Authenticate extends BaseModel
{
    protected $table = 'authenticate';
    protected $fillable = [
        'id',
        'application_rel_id',
        'hash',
        'status'
    ];

    public function UserApplication(){
        return $this->hasMany(UserApplication::class, 'id', 'application_rel_id');
    }   
}