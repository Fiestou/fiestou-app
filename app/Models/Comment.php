<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Comment extends BaseModel
{
    protected $table = 'comment';
    protected $fillable = [
        "id",
        "user",
        "parent",
        "product",
        "text",
        "rate",
        "status",
        "created_at",
        "updated_at"
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user')->select('id', 'name');
    }
}
