<?php

namespace App\Http\Controllers;

use DB;
use Image;
use Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Content;
use App\Models\Order;
use App\Models\Store;
use App\Models\Product;
use App\Models\Suborder;
use App\Models\Category;
use App\Models\User;
use App\Models\Media;

class CheckoutController extends Controller
{
    public function Create(Request $request){

        $request->validate([
            'products' => 'required',
        ]);

        $user = auth()->user();

        $user = User::where([ 'id' => $user->id ])
                    ->first()
                    ->DetailsUp();

        $products = Product::where(['status' => 1])
                            ->whereIn("id", $request->get("products"))
                            ->with(["store"])
                            ->get();

        $content = Content::where(["slug" => "checkout", "type" => "page"])
                        ->first();

        return response()->json([
            'response'  => true,
            'data'      => array_merge(
                                Content::getDefault(),
                                [
                                    "user"      => $user,
                                    "products"  => Product::normalize($products, false),
                                    "content"   => $content->setCustomContent()
                                ]
                            )
        ]);

        return response()->json([
            'response'  => false
        ]);
    }
}
