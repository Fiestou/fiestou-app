<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Content;
use App\Models\Category;
use App\Models\Product;
use App\Models\Media;
use App\Models\ContentRel;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    public $user;

    public function __construct(){
        $this->user = auth()->user();

        if(isset($this->user->id)){
            return response()->json([
                'response'  => false,
                'message'   => 'usuário não validado'
            ], 500);
            exit();
        }
    }

    public function getContent(Request $request){
        $request->validate([
            'type' => 'required'
        ]);

        return response()->json([
            'response'  => true,
            'data'      => []
        ]);
    }

    // OLD

    public function getDefault($json = false){

        $HeaderFooter = Content::where(["slug" => "menu", "type" => "page"])
                               ->first();

        $DataSeo = Content::where(["slug" => "seo", "type" => "page"])
                          ->first();

        $Scripts = Content::where(["slug" => "scripts", "type" => "page"])
                          ->first();

        $Roles = Content::where(["slug" => "roles", "type" => "roles"])
                        ->first();

        $data = [
            "HeaderFooter" => isset($HeaderFooter->id) ? $HeaderFooter->setCustomContent() : [],
            "DataSeo" => isset($DataSeo->id) ? $DataSeo->setCustomContent() : [],
            "Scripts" => isset($Scripts->id) ? $Scripts->setCustomContent() : [],
            "Roles" => isset($Roles->id) ? $Roles->setCustomContent() : []
        ];

        if($json){
            return response()->json([
                'response'  => true,
                'data'      => $data
            ]);
        }

        return $data;
    }

    public function Default(Request $request){
        return $this->getDefault(true);
    }

    public function Home(Request $request){

        $content = Content::where(["slug" => "home", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $categories = Category::with(["childs"])
                                  ->where("parent", ">",  0)
                                  ->get();

            $categories = Category::normalize($categories);

            $products = Product::with(["store"])
                               ->where(['status' => 1])
                               ->limit(12)
                               ->orderBy("id", "desc")
                               ->get();

            $posts = Content::where(["type" => "blog", "status" => 1])
                            ->limit(3)
                            ->get();

            foreach ($posts as $key => $post) {
                $posts[$key] = $post->setCustomContent();
            }

            $products = Product::normalize($products, false);

            $data = array_merge($this->getDefault(), [
                        "content"       => $content->setCustomContent(),
                        "categories"    => $categories,
                        "products"      => $products,
                        "posts"         => $posts
                	]);

            return response()->json([
                'response'  => true,
                'data'      => $data
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Products(Request $request){

        $content = Content::where(["slug" => "produtos", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $data = array_merge($this->getDefault(), [
                        "content" => $content->setCustomContent()
                    ]);

            return response()->json([
                'response'  => true,
                'data'      => $data
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Product(Request $request){

        $content = Content::where(["slug" => "produtos", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $categories = Category::with(["childs"])
                                  ->where(["parent" => NULL])
                                  ->get();

            foreach ($categories as $key => $category) {
                $category->childs = Category::reduceLevel($category->childs);
            }

            $data = array_merge($this->getDefault(), [
                "content" => $content->setCustomContent(),
                "categories" => $categories
            ]);

            return response()->json([
                'response'  => true,
                'data' => $data
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Graph(Request $request){

        $request->validate([
            'graphs.*.model' => 'required'
        ]);

        $content = new Content();
        $data = $content->GraphRequest($request->graphs, $this->user);

        return response()->json([
            'response'  => true,
            'data'      => $data
        ]);
    }

    public function RemoveContent(Request $request){

        $user   = auth()->user();
        $app_id = json_decode($this->user->details)->app;

        $request->validate([
            'contents_id'   => 'required',
            'area_id'       => 'required'
        ]);

        $contents_id = (is_array($request->contents_id)) ? $request->contents_id : [$request->contents_id];

        $contents = Content::with(['contents'])
                            ->whereIn('id', $contents_id)
                            ->where('application_id', $app_id)
                            ->get();

        $this->RecursiveRemoveContent($contents);

        $contents = $contents->where('application_id', $app_id)
                            ->orderBy('order', 'ASC')
                            ->orderBy('id', 'DESC')
                            ->get();

        return response()->json([
            'response'  => true,
            'list'      => ""
        ]);
    }

    public function ReorderContent(Request $request){

        $request->validate([
            'list'   => 'required'
        ]);

        $list = array_map(function($item) {
                    return $item['id'];
                }, $request->list);

        $content = Content::whereIn('id', $list)
                          ->get();

        foreach ($content as $key => $item) {

            $order = array_search($item->id, $list, true);

            Content::where('id', $item->id)->update(['order' => $order]);
        }

        return response()->json([
            'response'  => true,
            'list'      => $list
        ]);
    }
}
