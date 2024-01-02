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

        $categories = $categories->get();

        $categories = Category::normalize($categories);

        return response()->json([
            'response'  => true,
            'data'      => $categories
        ]);
    }

    public function Get(Request $request){

        $category = Category::with(["childs"])
                            ->orderBy('order', 'ASC');

        if($request->has('slug') && $request->get('slug')){
            $category = $category->where("slug", $request->get('slug'));
        }

        if($request->has('id') && $request->get('id')){
            $category = $category->where("id", $request->get('id'));
        }

        $category = $category->first();
        $category = Category::normalize([$category])[0];

        return response()->json([
            'response'  => true,
            'data'      => $category
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
