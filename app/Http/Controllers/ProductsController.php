<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Store;
use App\Models\Media;
use App\Models\Category;
use App\Models\CategoryRel;
use App\Models\Comment;
use Illuminate\Support\Str;

class ProductsController extends Controller
{
    public function Form(Request $request){

        if($request->has('id')){

            $user = auth()->user();
            $store = Store::where(["user" => $user->id])
                          ->first();

            if(!isset($store->id)){
                return response()->json([
                    'response'  => false
                ], 500);
            }

            $product = Product::where(['status' => 1])
                              ->where('id', (int) $request->get('id'))
                              ->where('store', $store->id)
                              ->first();

            if(isset($product->id)){
                return response()->json([
                    'response'  => true,
                    'data'      => Product::normalize([$product])[0]
                ]);
            }
        }

        return response()->json([
            'response'  => true,
            'data'      => []
        ]);
    }

    public function List(Request $request){

        $log = [];
        $metadata = [];
        $products = Product::where(['status' => 1])
                           ->with(["store"]);

        // if($request->has('select') && $request->get('select')){
        //     $products = $products->selectRaw('id, created_at, updated_at, ' . $request->get('select'));
        // }

        if($request->has('store') && $request->get('store')){
            $store = Store::where(["id" => $request->get('store')])->first();
            $products = isset($store->id) ? $products->where('store', $store->id) : $products;
        }

        if($request->has('whereIn')){
            $whereIn = $request->get('whereIn');
            $products = $products->where(function ($query) use ($whereIn) {
                $query->whereIn('id', $whereIn);
            });
        }

        if($request->has('cores') && $request->get('cores')){
            $colors = (is_array($request->get('cores'))) ? $request->get('cores') : [$request->get('cores')];
            $products = $products->where(function ($query) use ($colors) {
                foreach ($colors as $key => $color) {
                    $query->orWhere('color', "like", '%'.$color.'%');
                }
            });
        }

        if($request->has('busca') && $request->get('busca')){
            $busca = $request->get('busca');
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

        if($request->has('range') && $request->get('range')){
            $products = $products->where('price', '<=', $request->get('range'));
        }

        if($request->has('categorias') && $request->input('categorias')){
            $categories = (is_array($request->input('categorias'))) ? $request->input('categorias') : [$request->input('categorias')];
            $categories = Category::whereIn('slug', $categories)->pluck('id')->toArray();

            $whereIn    = CategoryRel::whereIn('category', $categories)->pluck('product')->toArray();
            $products   = $products->whereIn('id', $whereIn);
        }

        $count = $products;
        $metadata['count'] = $count->count();

        if($request->has('limit') && $request->get('limit')){
            $products = $products->limit($request->get('limit'));
        }

        if($request->has('offset') && $request->get('offset')){
            $products = $products->offset($request->get('offset'));
        }

        if($request->has('ordem') && !!$request->get('ordem')){
            $products = $products->orderBy('created_at', $request->get('ordem') == "asc" ? "asc" : "desc");
        }
        else{
            $products = $products->orderBy('title', 'asc')
                                ->orderBy('description', 'asc')
                                ->orderBy('tags', 'asc');
        }

        return response()->json([
            'response'  => true,
            'data'      => Product::normalize($products->get(), false),
            'metadata'  => $metadata,
            'log'       => $log
        ]);
    }

    public function Get(Request $request){

        $product = Product::with(["store", "comments.user"])
                          ->where('status', 1);

        if($request->has('id')){
            $product  = $product->where('id', $request->get('id'));
        }

        if($request->has('slug')){
            $product  = $product->where('slug', $request->get('slug'));
        }

        $product = $product->first();

        if(isset($product->id)){
            return response()->json([
                'response'  => true,
                '$product'  => $product,
                'data'      => Product::normalize([$product])[0]
            ]);
        }

        return response()->json([
            'response'  => false,
            'message' => $request->all()
        ]);
    }

    public function Remove(Request $request){

        $request->validate([
            "id" => "required"
        ]);

        $product = Product::where(['status' => 1]);

        if($request->has('id')){
            $product  = $product->where('id', $request->get('id'));
        }

        $product = $product->first();

        if(isset($product->id)){
            $product->status = 0;
            $product->save();

            return response()->json([
                'response'  => true,
                'data'      => $product->id
            ]);
        }

        return response()->json([
            'response'  => false,
            'message' => $request->all()
        ]);
    }

    public function Register(Request $request){

        $user = auth()->user();
        $store = Store::where(["user" => $user->id])
                       ->first();

        $product = new Product;

        if($request->has('id') && isset($store->id)){
            $product = Product::where(['status' => 1])
                              ->where('id', (int) $request->get('id'))
                              ->where('store', $store->id)
                              ->first();
        }

        foreach ($request->all() as $key => $value) {
            if(!in_array($key, ['gallery', 'attributes', 'combinations', 'category'])){
                $product->{$key} = $request->get($key);
            }
        }

        if($request->has('title')){
            $product->slug = Str::slug($request->get('title'));
        }

        if($request->has('gallery') && !empty($request->get('gallery'))){
            $product->gallery = json_encode($request->get('gallery'));
        }

        if($request->has('attributes') && !empty($request->get('attributes'))){
            $product->attributes = json_encode($request->get('attributes'));
        }

        if($request->has('combinations') && !empty($request->get('combinations'))){
            $combinations = array_map(function ($item) {
                                return $item['id'];
                            }, $request->get('combinations'));
            $product->combinations = json_encode(array_values($combinations));
        }

        $product->status    = 1;
        $product->store     = $store->id;
        $product->category  = json_encode([]);

        DB::beginTransaction();

        if($product->save()){

            if($request->has('category')){
                $relationship = [];
                CategoryRel::where(["product" => $product->id])->delete();

                $categories = $request->get('category');
                $categories = Category::whereIn("id", $categories)->get();

                foreach ($categories as $key => $category) {
                    $relationship[] = $category->id;
                    $handle = [$category->id];

                    if($category->parent){
                        $handle = Category::parents($category->parent, $handle);
                    }

                    foreach ($handle as $key => $id) {
                        $rel = new CategoryRel;

                        $exist = CategoryRel::where(["product" => $product->id])
                                            ->where(["category" => $id])
                                            ->first();

                        if(isset($exist->id)) $rel = $exist;

                        $rel->category = $id;
                        $rel->product = $product->id;
                        $rel->status = 1;
                        $rel->save();

                        $relationship[] = $id;
                    }
                }

                $product->category = json_encode(array_values(array_unique($relationship)));
                $product->save();
            }
        }
        else{
            DB::rollback();
        }

        DB::commit();

        return response()->json([
            'response'  => true,
            'data'    => $product
        ]);
    }
}
