<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

class Elements extends BaseModel
{
    protected $table = 'elements';
    protected $appends = ['descendants'];

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

    public function groupElements()
    {
        return $this->hasMany(GroupElements::class, 'id_elements');
    }

    public function scopeFromActiveGroups($query)
    {
        return $query->whereHas('groupElements.group', function ($q) {
            $q->where('active', 1);
        });
    }
    
    public function getDescendantsAttribute()
    {
        return self::getElementDescendants($this->id, 1);
    }

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
