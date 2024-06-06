<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Suborder;
use App\Models\Message;

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
            Message::CompleteOrderMail();
            Message::PartnerNewOrderMail();

            $order->status          = 1;
            $order->deliveryStatus  = 'processing';
            Suborder::where('order', $order->id)->update(['status' => 1, 'deliveryStatus' => 'processing']);
        }

        if($request->get("type") == "order.canceled"){
            $order->status          = -2;
            $order->deliveryStatus  = 'canceled';
            Suborder::where('order', $order->id)->update(['status' => -2, 'deliveryStatus' => 'canceled']);
        }

        $order->save();

        return response()->json($order, 200);
    }
}
