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

class OrdersController extends Controller
{
    public function Get(Request $request){

        $request->validate([
            "id" => "required"
        ]);

        $user = auth()->user();

        $order = Order::where(['id' => $request->get('id'), "user" => $user->id])
                      ->first();

        if(isset($order->id)){

            $order->metadata = json_decode($order->metadata);
            $order->listItems = json_decode($order->listItems);
            $order->deliveryAddress = json_decode($order->deliveryAddress);

            $user = User::where(["id" => $order->user])->first();

            if(isset($user->id)){
                $details = json_decode($user->details, TRUE);
                foreach ($details as $key => $value) {
                    $user->{$key} = $value;
                }
                unset($user->details);
            }

            $order->user = $user;

            $products = [];

            foreach ($order->listItems as $key => $item) {
                array_push($products, $item->product->id);
            }

            $products = Product::with(['store'])
                                      ->where(['status' => 1])
                                      ->whereIn('id', $products)
                                      ->get();

            $notificate = [];

            foreach ($products as $key => $item) {
                if(!isset($notificate[$item->store])){
                    $store = Store::select(["user"])
                                  ->where(["id" => $item->store])
                                  ->first();

                    $user = User::select(["name", "email", "details"])
                                ->where([ 'id' => $store->user ])
                                ->first();

                    if(isset($user->email)){
                        $details = json_decode($user->details, TRUE);
                        if(isset($details['phone'])){
                            $user->phone = $details['phone'];
                        }
                        unset($user->details);
                    }

                    $notificate[$item->store] = $user;
                }
            }

            $order->notificate  = array_values($notificate);

            $products = Product::normalize($products);

            foreach ($products as $key => $product) {
                foreach ($order->listItems as $i => $item) {
                    if($item->product->id == $product->id){
                        unset($product->category);
                        unset($product->combinations);
                        unset($product->fragility);
                        unset($product->freeTax);

                        $item->product = $product;
                    }
                }
            }

            return response()->json([
                'response'  => true,
                'data' => $order
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function List(Request $request){
        $user = auth()->user();

        $orders = Order::orderBy('id', 'DESC');

        if($user->person != "master"){
            $orders = $orders->where(["user" => $user->id]);
        }

        $orders = $orders->get();

        foreach ($orders as $key => $order) {
            $order->deliveryAddress = json_decode($order->deliveryAddress, TRUE);
            $order->listItems = json_decode($order->listItems, TRUE);
            $order->metadata = json_decode($order->metadata, TRUE);
        }

        return response()->json([
            'response'  => true,
            'data'      => $orders
        ]);
    }

    public function Store(Request $request){

        $user = auth()->user();

        $store = Store::where(["user" => $user->id])
                      ->first();

        $suborders = Suborder::with(["order"])
                             ->where(["store" => $store->id])
                             ->get();

        return response()->json([
            'response'  => true,
            'data'      => $suborders
        ]);
    }

    public function Register(Request $request){

        $request->validate([
            "deliveryAddress" => "required",
            "listItems"  => "required"
        ]);

        $listItems = $request->get("listItems");

        $user = auth()->user();

        $order = new Order;
        $order->user                = $user->id;
        $order->platformCommission  = $request->get("platformCommission");
        $order->total               = $request->get("total");
        $order->deliverySchedule    = $request->get("deliverySchedule");
        $order->deliveryAddress     = json_encode($request->get("deliveryAddress"));
        $order->deliveryStatus      = $request->get("deliveryStatus");
        $order->listItems           = json_encode($listItems);
        $order->status              = -1;

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
            $product->save();
        }

        DB::beginTransaction();

        if($order->save()){

            $suborders = [];

            foreach ($request->get("listItems") as $key => $item) {
                $index = $item['product']['store']['id'];

                if (!isset($suborders[$index])) {
                    $suborders[$index] = [
                        "listItems"     => [],
                        "total"    => 0
                    ];
                }

                $suborders[$index]['listItems'][] = $item['product']['id'];
                $suborders[$index]['total'] += $item['total'];
            }

            foreach ($suborders as $key => $suborder) {
                $sub = new Suborder;
                $sub->store     = $key;
                $sub->user      = $user->id;
                $sub->order     = $order->id;
                $sub->total     = $suborder['total'];
                $sub->paying    = $suborder['total'] - (($order->platformCommission / 100) * $suborder['total']);
                $sub->listItems = json_encode($suborder['listItems']);
                $sub->deliveryStatus        = "pending";
                $sub->deliverySchedule      = $order->deliverySchedule;
                $sub->status = -1;
                $sub->save();
            }
        }
        else{

            DB::rollback();

            return response()->json([
                'response'  => false
            ]);
        }

        DB::commit();

        return response()->json([
            'response'  => true,
            'data' => $order
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
            $metadata           = $request->get('metadata');
            $order->metadata    = json_encode($metadata);

            if($metadata['status'] == 'complete'){
                $order->status = 1;
                $order->deliveryStatus = 'processing';
                Suborder::where('order', $order->id)->update(['status' => 1, 'deliveryStatus' => 'processing']);
            }
            else{
                $order->status = 0;
                $order->deliveryStatus = 'pending';
                Suborder::where('order', $order->id)->update(['status' => 0, 'deliveryStatus' => 'pending']);
            }

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
