<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Suborder;
use App\Models\Message;
use App\Models\User;
use App\Models\Product;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class HooksController extends Controller
{

    public function Pagarme(Request $request)
    {
        $data       = $request->get("data");
        $customer   = $data["customer"];
        $orderID    = $customer["metadata"]["orderID"];

        $order = Order::where(['id' => $orderID, "user" => $customer["code"]])
                      ->first();

        if($request->get("type") == "order.created" && $data["status"] == "pending"){
            $order->status          = 0;
            $order->deliveryStatus  = 'pending';

            $metadata           = $data["charges"][0];
            $order->metadata    = json_encode($metadata["last_transaction"]);

            Suborder::where('order', $order->id)->update(['status' => 0, 'deliveryStatus' => 'pending']);
        }

        if(!!$order){
            if($request->get("type") == "order.paid" && $data["status"] == "paid"){
                $metadata = !!$order->metadata ? json_decode($order->metadata, TRUE) : [];

                $payment = $data["charges"][0];

                $metadata["paid_at"]        = $payment["paid_at"];
                $metadata["payment_method"] = $payment["payment_method"];
                $metadata["installments"]   = 1;

                if(isset($payment["payment_method"]['last_transaction']["installments"])){
                    $metadata["installments"] = $payment["payment_method"]['last_transaction']["installments"];
                }

                $listItems = json_decode($order->listItems, TRUE);

                foreach ($listItems as $key => $item) {
                    $product = Product::where('id', $item['product']['id'])
                                    ->first();

                    $unavailable = !!$product->unavailable ? json_decode($product->unavailable, TRUE) : [];
                    $unavailable = array_merge($unavailable, $item['product']['unavailable']);

                    foreach($unavailable as $day => $date){
                        $dataToCheck = Carbon::createFromFormat('Y-m-d', $date);
                        $dataCurrent = Carbon::now();

                        if ($dataCurrent->gt($dataToCheck)) {
                            unset($unavailable[$day]);
                        }
                    }

                    $product->unavailable = json_encode($unavailable);

                    if($product->quantityType != "ondemand" && $product->comercialType == "selling"){
                        $product->quantity = !!intval($product->quantity) ? intval($product->quantity) - (!!intval($item['quantity']) ? $item['quantity'] : 1) : 0;
                    }

                    $product->save();
                }

                $order->status          = 1;
                $order->deliveryStatus  = 'processing';
                $order->metadata  = json_encode($metadata);
                Suborder::where('order', $order->id)->update(['status' => 1, 'deliveryStatus' => 'processing']);

                Message::CompleteOrder($order);
                Message::PartnerNewOrder($order);
            }

            if($request->get("type") == "order.canceled"
            || $request->get("type") == "charge.payment_failed"
            || ($request->get("type") == "order.closed" && $data["status"] != "paid")){
                $order->status          = -2;
                $order->deliveryStatus  = 'canceled';
                Suborder::where('order', $order->id)->update(['status' => -2, 'deliveryStatus' => 'canceled']);
            }

            unset($order->notificate);

            $order->save();
        }

        return response()->json($order, 200);
    }
}
