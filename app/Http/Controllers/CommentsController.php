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

        $comment = new Comment;
        $recovery = Comment::where(['product' => $request->get("product"), "user" => $user->id])
                           ->first();

        if(isset($recovery->id)){
            $comment = $recovery;
        }

        $comment->user  = $user->id;
        $comment->product = $request->get("product");
        $comment->text = $request->get("comment");
        $comment->rate = $request->get("rate");
        $comment->status = 1;

        if($request->has("parent")) $comment->parent = $request->get("parent");

        DB::beginTransaction();

        if(!$comment->save()){
            DB::rollback();

            return response()->json([
                'response'  => false
            ]);
        }

        DB::commit();

        return response()->json([
            'response'  => true,
            'data' => $comment
        ]);
    }
}
