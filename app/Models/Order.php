<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Models\User;
use App\Models\Store;

class Order extends BaseModel
{
    protected $table = 'order';

    protected $fillable = [
        "id",
        "user",
        "store",
        "hash",
        "deliveryStatus",
        "deliverySchedule",
        "deliveryAddress",
        "deliveryPrice",
        "total",
        "platformCommission",
        "listItems",
        "metadata",
        "status",
        "created_at",
        "updated_at"
    ];

    public function store()
    {
        return $this->belongsTo(Store::class, 'store', 'id');
    }

    public function userDetail()
    {
        return $this->belongsTo(User::class, 'user', 'id');
    }

    public static function DeliveryTypes($key)
    {
        $deliveryTypes = [
            "pending"           => "⌛ Pagamento",
            "processing"        => "👍 Em separação",
            "sent"              => "📦 Enviado",
            "transiting"        => "🚚 Em trânsito",
            "received"          => "☑️ Entregue",
            "returned"          => "🔄 Retornado",
            "canceled"          => "❌ Cancelado",
            "waitingWithdrawl"  => "⏱️ Aguardando retirada",
            "collect"           => "🚚 Chegando para recolher",
            "complete"          => "✅ Concluído",
        ];

        return $deliveryTypes[$key] ?? "";
    }

    public static function DeliveryToName($key)
    {
        $deliveryToName = [
            "reception" => "Entregar na portaria",
            "door"      => "Deixar na porta",
            "for_me"    => "Estarei para receber",
        ];

        return $deliveryToName[$key] ?? "";
    }
}
