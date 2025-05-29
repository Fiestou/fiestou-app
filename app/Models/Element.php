<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\DB;

class Element extends BaseModel
{
    protected $table = 'elements';

    protected $fillable = [
        'id',
        'name',
        'description',
        'icon',
        'group_id',
        'active',
        'element_related_id',
        'created_at',
        'updated_at',
    ];

    // Relacionamento direto com a tabela Group
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    // Relacionamento para elementos relacionados (filhos)
    public function relatedElements()
    {
        return $this->belongsToMany(Element::class, 'element_related', 'element_id', 'related_element_id');
    }

    // Relacionamento para o elemento pai
    public function parentElement()
    {
        return $this->belongsTo(Element::class, 'element_related_id');
    }

    protected $casts = [
        'element_related_id' => 'array',
    ];

    // Escopo para filtrar elementos que pertencem a grupos ativos
    public function scopeFromActiveGroups($query)
    {
        return $query->whereHas('group', function ($q) {
            $q->where('active', 1);
        });
    }

    public function getDescendantsAttribute()
    {
        return self::getElementDescendants($this->id, 1);
    }
    
    public function scopeFromTargetAdcGroups($query)
    {
        return $query->whereHas('group', function ($q) {
            $q->where('target_adc', true);
        });
    }

    /**
     * Obtém todos os descendentes de um elemento.
     *
     * @param int $elementsId
     * @param bool|null $isActive
     * @return array
     */
    public static function getElementDescendants($elementsId, $isActive = null)
    {
        $query = self::where('element_related_id', $elementsId);
    
        if (!is_null($isActive)) {
            $query->where('active', $isActive);
        }
    
        return $query->get();
    }
}