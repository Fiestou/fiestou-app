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
     * @param int $groupId
     * @param bool|null $isActive
     * @return array
     */
    public static function getElementDescendants($groupId, $isActive = null)
    {
        $query = "CALL GetElementDescendants(:group_id, :is_active)";

        return DB::select($query, [
            'group_id' => $groupId,
            'is_active' => $isActive
        ]);
    }
}
