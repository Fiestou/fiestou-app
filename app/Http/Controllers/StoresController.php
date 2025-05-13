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
                      
        $groups = Group::where('active', 1)->get();
    
        if(isset($store->id)){
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
    
            $store->openClose   = json_decode($store->openClose);
            $store->metadata    = json_decode($store->metadata);
    
            return response()->json([
                'response'  => true,
                'data'      => $store,
                'groups'    => $groups
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

            $cover      = $store->cover;
            $profile    = $store->profile;

            if($request->has('cover') && !!$request->get('cover')){
                $cover = $request->get('cover');
                $cover = $cover['id'];
            }

            if($request->has('profile') && !!$request->get('profile')){
                $profile = $request->get('profile');
                $profile = $profile['id'];
            }

            $store->RequestToThis($request);

            $store->cover       = $cover;
            $store->profile     = $profile;
            $store->openClose   = json_encode($request->get('openClose'));
            $store->metadata    = json_encode($request->get('metadata'));

            DB::beginTransaction();

            if(!$store->save()){
                DB::rollback();
            }

            DB::commit();

            $store->cover   = !!$store->$cover      ? Media::TakeImage($store->cover)   : NULL;
            $store->profile = !!$store->$profile    ? Media::TakeImage($store->profile) : NULL;

            return response()->json([
                'response'  => true,
                'request'   => [$cover, $profile],
                'data'      => $store
            ]);
        }

        return response()->json([
            'response'  => false
        ], 500);
    }

    public function CompleteRegister(Request $request){

        $request->validate([
            'email' => 'required'
        ]);

        $user  = User::where(["email" => $request->get("email")])
                     ->first();

        $store  = Store::where(["user" => $user->id])->first();

        if(!$store){
            $store = new Store;
        }

        if($request->has("document")){
            $store->document = $request->get("document");
        }

        if($request->has("companyName")){
            $store->title       = $request->get("companyName");
            $store->slug        = Str::slug(strip_tags($request->get("companyName")));
            $store->companyName = $request->get("companyName");
        }

        $user->RequestToThis($request);

        $user->person = "partner";
        $user->save();

        $store->RequestToThis($request);

        $store->user        = $user->id;
        $store->hasDelivery = $request->get("hasDelivery", false);
        $store->status      = 0;
        $store->save();

        return response()->json([
            'response'  => true,
            'data'      => $request->all()
        ]);
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
