<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

class Group extends BaseModel
{
    protected $table = 'group'; // A tabela foi renomeada para 'groups'
    
    protected $fillable = [
        'id',
        'name',
        'description',
        'active',
        'target_adc', 
        'segment',
    ];
    protected $casts = [
        'segment' => 'boolean'
    ];

    // Escopo para filtrar grupos ativos
    public function scopeActive($query)
    {
        return $query->where('active', 1);
    }

    // Relacionamento 1:N com a tabela elements
    public function elements()
    {
        return $this->hasMany(Element::class, 'group_id');
    }
    // Método estático para buscar todos os descendentes de um grupo
    public static function getAllDescendants($groupId, $isActive = null)
    {
        $query = "CALL GetAllGroupDescendants(:group_id, :is_active)";
        return DB::select($query, [
            'group_id' => $groupId,
            'is_active' => $isActive
        ]);
    }
}