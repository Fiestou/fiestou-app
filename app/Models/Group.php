<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

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

    /**
     * Obtém todos os descendentes do grupo.
     *
     * @param int $groupId
     * @param bool|null $isActive
     * @return array
     */
    public static function getAllDescendants($groupId, $isActive = null)
    {
        $query = "CALL GetAllGroupDescendants(:group_id, :is_active)";

        return DB::select($query, [
            'group_id' => $groupId,
            'is_active' => $isActive
        ]);
    }
}
