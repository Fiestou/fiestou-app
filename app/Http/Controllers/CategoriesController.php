<?php

namespace App\Http\Controllers;

use DB;
use Image;
use Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Media;
use App\Models\Category;
use App\Models\Product;
use App\Models\CategoryRel;

class CategoriesController extends Controller
{
    public function List(Request $request){

        $categories = Category::with(["childs"])
                              ->where(["parent" => NULL])
                              ->orderBy('order', 'ASC');

        if($request->has('slug') && $request->get('slug')){
            $categories = $categories->whereIn("slug", $request->get('slug'));
        }

        if($request->has('id') && $request->get('id')){
            $categories = $categories->whereIn("id", $request->get('id'));
        }

        return response()->json([
            'response'  => true,
            'data'      => Category::normalize($categories->get())
        ]);
    }

    public function Paths(Request $request){

        $categories = Category::select(['slug']);
        $categories = Category::normalize($categories->get());

        return response()->json([
            'response'  => true,
            'data'      => $categories
        ]);
    }

    public function Get(Request $request){

        $log = [];
        $metadata = [];

        $category = Category::with(["childs"]);

        if($request->has('slug') && $request->get('slug')){
            $category = $category->where("slug", $request->get('slug'));
        }

        if($request->has('id') && $request->get('id')){
            $category = $category->where("id", $request->get('id'));
        }

        $category = $category->first();
        $category = Category::normalize([$category])[0];

        $whereIn    = CategoryRel::whereIn('category', [$category->id])
                                ->pluck('product')
                                ->toArray();

        $products = Product::with(["store"])
                           ->where(["status" => 1])
                           ->whereIn('id', $whereIn);

        $count = $products;
        $metadata['count'] = $products->count();

        if($request->has('limit') && $request->get('limit')){
            $products = $products->limit($request->get('limit'));
        }

        if($request->has('offset') && $request->get('offset')){
            $products = $products->offset($request->get('offset'));
        }

        return response()->json([
            'response'  => true,
            'data'      => [
                            'category' => $category,
                            'products' => Product::normalize($products->get(), false),
                        ],
            "metadata"  => $metadata,
            'log'       => $log
        ]);
    }

    public function Register(Request $request){

        $request->validate([
            "title" => "required",
        ]);

        $user = auth()->user();

        $category = new Category;
        $category->status = 1;

        if($request->has("id") && !!$request->get("id")){
            $recovery = Category::where(['id' => $request->get("id")])
                                ->first();

            if(isset($recovery->id)){
                $category = $recovery;
            }
        }

        foreach ($request->all() as $key => $value) {
            $category->{$key} = $value;
        }

        if($request->has('title')){
            $category->title = $request->get('title');
            $category->slug = Str::slug($request->get('title'));
        }

        if($request->has('image'))
            $category->image = $request->get('image');

        if($request->has('metadata'))
            $category->metadata = json_encode(!!$request->has('metadata') ? $request->get('metadata') : []);

        if($request->has('closest'))
            $category->closest = json_encode(!!$request->has('closest') ? $request->get('closest') : []);

        DB::beginTransaction();

        if(!$category->save()){
            DB::rollback();

            return response()->json([
                'response'  => false
            ]);
        }

        DB::commit();

        $categories = Category::with(["childs"])
                              ->where(["parent" => NULL])
                              ->get();

        $categories = Category::normalize($categories);

        return response()->json([
            'response'  => true,
            'data'      => $categories,
            'log'       => [$request->get('closest'), $request->get('metadata')]
        ]);
    }
}
