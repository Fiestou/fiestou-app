<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\Str;
use DB;

class Order extends BaseModel
{
    protected $table = 'order';
    protected $fillable = [
        "id",
        "user",
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

    public static function DeliveryTypes($key){
        $deliveryTypes = [
            "pending"       => "⌛ Pagamento",
            "processing"    => "👍 Em separação",
            "sent"          => "📦 Enviado",
            "transiting"    => "🚚 Em trânsito",
            "received"      => "☑️ Entregue",
            "returned"      => "🔄 Retornado",
            "canceled"      => "❌ Cancelado",
            "waitingWithdrawl"  => "⏱️ Aguardando retirada",
            "collect"           => "🚚 Chegando para recolher",
            "complete"          => "✅ Concluído",
        ];

        return isset($deliveryTypes[$key]) ? $deliveryTypes[$key] : "";
    }

    public static function DeliveryToName($key){
        $deliveryToName = [
            "reception" => "Entregar na portaria",
            "door"      => "Deixar na porta",
            "for_me"    => "Estarei para receber",
        ];

        return isset($deliveryToName[$key]) ? $deliveryToName[$key] : "";
    }

}
