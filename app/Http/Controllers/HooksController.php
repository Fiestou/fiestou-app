<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Suborder;
use App\Models\Message;
use App\Models\User;

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
            Suborder::where('order', $order->id)->update(['status' => 0, 'deliveryStatus' => 'pending']);
        }

        if($request->get("type") == "order.paid" && $data["status"] == "paid"){
            $metadata = !!$order->metadata ? json_decode($order->metadata, TRUE) : [];

            $payment = $data["charges"][0];

            $metadata["paid_at"]        = $payment["paid_at"];
            $metadata["payment_method"] = $payment["payment_method"];
            $metadata["installments"]   = 1;

            if(isset($payment["payment_method"]['last_transaction']["installments"])){
                $metadata["installments"] = $payment["payment_method"]['last_transaction']["installments"];
            }

            $order->status          = 1;
            $order->deliveryStatus  = 'processing';
            $order->metadata  = json_encode($metadata);
            Suborder::where('order', $order->id)->update(['status' => 1, 'deliveryStatus' => 'processing']);

            Message::CompleteOrder($order);
            Message::PartnerNewOrder($order);
        }

        if($request->get("type") == "order.canceled"){
            $order->status          = -2;
            $order->deliveryStatus  = 'canceled';
            Suborder::where('order', $order->id)->update(['status' => -2, 'deliveryStatus' => 'canceled']);
        }

        unset($order->notificate);
        $order->save();

        return response()->json($order, 200);
    }
}
