<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Order;
use App\Models\User;
use App\Models\Store;
use App\Models\Suborder;
use App\Models\Product;

class SubordersController extends Controller
{
    public function Get(Request $request){

        $request->validate([
            "id" => "required"
        ]);

        $user = auth()->user();
        $store = Store::where("user", $user->id)->first();

        if(isset($store->id)){

            $suborder = Suborder::with(["parent"])
                                ->where(['id' => $request->get('id')])
                                ->where(['store' => $store->id])
                                ->first();

            if(isset($suborder->id)){
                $order = $suborder->parent;
                unset($suborder->parent);

                $order->metadata        = json_decode($order->metadata);
                $order->listItems       = json_decode($order->listItems);
                $order->deliveryAddress = json_decode($order->deliveryAddress);
                $order->user            = User::where(["id" => $order->user])->first();

                $products = [];

                foreach ($order->listItems as $key => $item) {
                    array_push($products, $item->product->id);
                }

                $order->products = Product::with(['store'])
                                          ->whereIn('id', $products)
                                          ->get();

                $suborder->order = $order;
                $suborder->user  = $order->user;

                return response()->json([
                    'response'  => true,
                    'data'      => $suborder,
                ]);
            }

            return response()->json([
                'response'  => false
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function List(Request $request){

        $user = auth()->user();

        $store = Store::where("user", $user->id)->first();

        if(isset($store->id)){
            $suborders = Suborder::with(["parent"])
                                 ->orderBy('id', 'DESC')
                                 ->where(["store" => $store->id])
                                 ->get();

            foreach ($suborders as $key => $suborder) {
                $order = $suborder->parent;
                unset($suborder->parent);

                $order->metadata        = json_decode($order->metadata);
                $order->listItems       = json_decode($order->listItems);
                $order->deliveryAddress = json_decode($order->deliveryAddress);
                $order->user            = User::where(["id" => $order->user])->first();

                $products = [];

                foreach ($order->listItems as $key => $item) {
                    array_push($products, $item->product->id);
                }

                $order->products = Product::with(['store'])
                                          ->whereIn('id', $products)
                                          ->get();

                $suborder->order = $order;
            }

            return response()->json([
                'response'  => true,
                'data'      => $suborders
            ]);
        }

        return response()->json([
            'response'  => false,
        ]);
    }

    public function Register(Request $request){

        $request->validate([
            "id"  => "required"
        ]);

        if(!$request->has('id')){
            return response()->json([
                'response'  => false
            ]);
        }

        $suborder = Suborder::where(['id' => $request->get('id')])->first();

        if(isset($suborder->id)){

            $order = Order::where(['id' => $suborder->order])->first();

<<<<<<< HEAD
            $suborder->deliveryStatus   = $request->get("deliveryStatus");
            $suborder->status           = $request->get("status") ?? 1;

            $order->deliveryStatus  = $request->get("deliveryStatus");
            $order->status          = $request->get("status") ?? 1;

            DB::beginTransaction();

            if(!$suborder->save() || !$order->save()){
=======
            $suborder->deliveryStatus = $request->get("deliveryStatus");
            $suborder->status = $request->get("status") ?? 1;

            DB::beginTransaction();

            if(!$suborder->save()){
>>>>>>> refs/remotes/origin/master

                DB::rollback();

                return response()->json([
                    'response'  => false
                ]);
            }

            DB::commit();

            return response()->json([
                'response'  => true,
                'data' => $suborder
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function RegisterMeta(Request $request){

        $request->validate([
            "id"        => "required",
            "metadata"  => "required"
        ]);

        $user = auth()->user();

        $order = Order::where(['id' => $request->get('id'), "user" => $user->id])
                      ->first();

        if(isset($order->id)){
            $order->metadata = json_encode($request->get('metadata'));
            if($order->save()){
                return response()->json([
                    'response'  => true
                ]);
            }
        }

        return response()->json([
            'response'  => false
        ]);
    }
}
