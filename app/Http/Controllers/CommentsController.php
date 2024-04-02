<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Comment;
use App\Models\Product;

class CommentsController extends Controller
{
    public function List(Request $request){

        $request->validate([
            "product"   => "required"
        ]);

        $comments = Comment::where(["product" => $request->get('product')])
                           ->get();

        return response()->json([
            'response'  => true,
            'data'      => $comments
        ]);
    }

    public function Register(Request $request){

        $request->validate([
            "rate"      => "required",
            "comment"   => "required",
            "product"   => "required"
        ]);

        $user = auth()->user();

        $comment = Comment::where(['product' => $request->get("product"), "user" => $user->id])
                           ->first();

        if(!isset($comment->id)){
            $comment = new Comment;
        }

        $comment->user      = $user->id;
        $comment->product   = $request->get("product");
        $comment->text      = $request->get("comment");
        $comment->rate      = $request->get("rate");
        $comment->status    = 1;

        if($request->has("parent")) $comment->parent = $request->get("parent");

        DB::beginTransaction();

        if(!$comment->save()){
            DB::rollback();

            return response()->json([
                'response'  => false
            ]);
        }

        DB::commit();

        $product = Product::where(['id' => $request->get("product")])
                          ->first();

        if(isset($product->id)){

            $count = Comment::where(['product' => $request->get("product")])
                            ->count();

            $sum = Comment::where(['product' => $request->get("product")])
                          ->sum("rate");

            $product->rate = $sum / $count;
            $product->save();
        }

        return response()->json([
            'response'  => true,
            'data' => $comment
        ]);
    }
}
