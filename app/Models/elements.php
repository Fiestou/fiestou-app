<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

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

    /**
     * Obtém todos os descendentes do elemento.
     *
     * @param int $elementsId
     * @param bool|null $isActive
     * @return array
     */
    public static function getElementDescendants($elementsId, $isActive = null)
    {
        $query = "CALL GetElementDescendants(:elementsId, :is_active)";

        return DB::select($query, [
            'elementsId' => $elementsId,
            'is_active' => $isActive
        ]);
    }
}
