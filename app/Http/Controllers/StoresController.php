<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Store;
use App\Models\Suborder;
use App\Models\User;
use App\Models\Media;
use App\Models\Customer;
use App\Models\Withdraw;
use App\Models\Category;
use App\Models\CategoryRel;
use Illuminate\Support\Str;

class StoresController extends Controller
{
    public function Balance(Request $request){

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
                      ->first();

        $payments   = Suborder::where(['store' => $store->id, 'status' => 1])->sum('paying');
        $withdraw   = Withdraw::where(['store' => $store->id, 'status' => 1])->sum('value');

        $cash       = $payments - $withdraw;
        $payments   = $payments;
        $orders     = Suborder::where(['store' => $store->id])->count();
        $promises   = Suborder::where(['store' => $store->id])
                            ->where(function($query){
                                $query->where('status', 0)
                                      ->orWhere('status', 2);
                            })->sum('paying');

        $balance = [
            'cash' => $cash,
            'payments' => $payments,
            'promises' => $promises,
            'orders' => $orders
        ];

        return response()->json([
            'response'  => true,
            'data'      => $balance
        ]);
    }

    public function Form(Request $request){

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
                      ->first();

        if(isset($store->id)){

            $store->cover = json_decode($store->cover);
            $store->profile = json_decode($store->profile);
            $store->openClose = json_decode($store->openClose);
            // $store->meta = json_decode($store->meta);

            return response()->json([
                'response'  => true,
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function Get(Request $request){

        $request->validate([
            'slug' => 'required'
        ]);

        $store = Store::where("slug", $request->get('slug'))
                      ->where("status", 1)
                      ->first();

        if(isset($store->id)){

            $products = Product::with(["store"])
                               ->where('store', $store->id);

            $cover = !!$store->cover ? Media::where(['id' => $store->cover])->first() : [];
            if(isset($cover->id)){
                $cover->details = json_decode($cover->details);
                $store->cover   = $cover;
            }

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if(isset($profile->id)){
                $profile->details = json_decode($profile->details);
                $store->profile   = $profile;
            }

            $store->products    = Product::normalize($products->get(), false);
            $store->openClose   = json_decode($store->openClose);
            $store->metadata    = json_decode($store->metadata);

            return response()->json([
                'response'  => true,
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function List(Request $request){

        $stores = Store::orderBy('id', 'DESC')
                       ->where('status', 1)
                       ->get();

        foreach ($stores as $key => $store) {

            $profile = !!$store->profile ? Media::where(['id' => $store->profile])->first() : [];
            if(isset($profile->id)){
                $profile->details = json_decode($profile->details);
                $store->profile   = $profile;
            }

            $store->metadata    = json_decode($store->metadata);
        }

        return response()->json([
            'response'  => true,
            'data'      => $stores
        ]);
    }

    public function Customers(Request $request){

        $request->validate([
            'store' => 'required'
        ]);

        $user = auth()->user();

        $store = Store::where(["user" => $user->id, "id" => $request->get("store")])
                      ->first();

        if(isset($store->id)){

            $users = Suborder::where(['store' => $store->id])
                             ->groupBy('user')
                             ->pluck('user')
                             ->toArray();

            $customers = User::whereIn('id', $users);

            if($request->has('id')){
                $customers = $customers->where(['id' => $request->get('id')])->first();
                $customers->DetailsUp();
            }
            else{
                $customers = $customers->get();
            }

            return response()->json([
                'response'  => true,
                'data'      => $customers
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Register(Request $request){

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        if(isset($store->id)){
            $store = Store::where('id', $store->id)
                          ->first();

            $store->RequestToThis($request);

            $store->cover = json_encode($request->get('cover'));
            $store->cover = json_encode($request->get('cover'));
            $store->profile = json_encode($request->get('profile'));
            $store->openClose = json_encode($request->get('openClose'));
            $store->meta = json_encode($request->get('meta'));

            DB::beginTransaction();

            if(!$store->save()){
                DB::rollback();
            }

            DB::commit();

            return response()->json([
                'response'  => true,
                'request'   => $request->all(),
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function Products(Request $request){

        $user   = auth()->user();
        $store  = Store::where(["user" => $user->id])
                       ->first();

        $log = [];
        $metadata = [];
        $products = Product::where('status', '<>', 0)
                            ->where('store', $store->id)
                            ->with(["store"]);

        if($request->has('search') && $request->get('search')){
            $busca = $request->get('search');
            $products = $products->where(function ($query) use ($busca) {
                $busca = is_array($busca) ? $busca : [$busca];
                foreach($busca as $term){
                    $query->orWhere('tags', "like", '%'.$term.'%');
                    $query->orWhere('title', "like", '%'.$term.'%');
                    $query->orWhere('subtitle', "like", '%'.$term.'%');
                    $query->orWhere('description', "like", '%'.$term.'%');
                }
            });
        }

        if($request->has('limit') && $request->get('limit')){
            $products = $products->limit($request->get('limit'));
        }

        if($request->has('colors') && $request->get('colors')){
            $colors = (is_array($request->get('colors'))) ? $request->get('colors') : [$request->get('colors')];
            $products = $products->where(function ($query) use ($colors) {
                foreach ($colors as $key => $color) {
                    $query->orWhere('color', "like", '%'.$color.'%');
                }
            });
        }

        if($request->has('range') && $request->get('range')){
            $products = $products->where('price', '<=', $request->get('range'));
        }

        if($request->has('categories') && $request->input('categories')){
            $categories = (is_array($request->input('categories'))) ? $request->input('categories') : [$request->input('categories')];
            $categories = Category::whereIn('slug', $categories)->pluck('id')->toArray();

            $whereIn    = CategoryRel::whereIn('category', $categories)->pluck('product')->toArray();
            $products   = $products->whereIn('id', $whereIn);
        }

        if($request->has('order') && !!$request->get('order')){
            $products = $products->orderBy('created_at', $request->get('order') == "asc" ? "asc" : "desc");
        }
        else{
            $products = $products->orderBy('title', 'asc')
                                ->orderBy('description', 'asc')
                                ->orderBy('tags', 'asc');
        }

        $limit  = $request->get("limit", 25);
        $page   = $request->get("page", 0);

        $products = $products->paginate($limit, ['*'], 'page', $page);

        $items = $products->items();
        $total = $products->total();

        $metadata = [
            'pages' => ceil($total / $limit),
            "total" => $products->total()
        ];

        return response()->json([
            'response'  => true,
            'data'      => Product::normalize($items, false),
            'metadata'  => $metadata
        ]);
    }
}
