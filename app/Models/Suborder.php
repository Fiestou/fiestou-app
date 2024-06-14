<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\Order;
use Illuminate\Support\Str;
use DB;

class Suborder extends BaseModel
{
    protected $table = 'suborder';
    protected $fillable = [
        "id",
        "order",
        "store",
        "user",
        "deliveryStatus",
        "deliverySchedule",
        "total",
        "listItems",
        "status",
        "created_at",
        "updated_at"
    ];

    public function parent(){
        return $this->hasOne(Order::class, 'id', 'order');
    }

    public static function CleanSchedule($order){

        $items = json_decode($order->listItems, TRUE);

        foreach ($items as $key => $item) {
            $handle = $item["product"];

            $itemUnavailable = $handle["unavailable"];

            if(count($itemUnavailable)){
                $itemUnavailable = $itemUnavailable[0];

                $product = Product::where(["id" => $handle["id"]])->first();

                $productUnavailable = json_decode($product->unavailable, TRUE);

                $productUnavailable = array_values(array_diff($productUnavailable, [$itemUnavailable]));

                $product->unavailable = json_encode($productUnavailable);

                if($product->quantityType != "ondemand" && $product->comercialType == "renting"){
                    $product->quantity = intval($product->quantity) + (!!intval($item['quantity']) ? intval($item['quantity']) : 1);
                }

                $product->save();
            }
        }
    }
}
