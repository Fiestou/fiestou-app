<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Content;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\Media;
use App\Models\ContentRel;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Log;

class ContentController extends Controller
{
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

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    [
                                        "Home"          => $content->setCustomContent(),
                                        "Categories"    => $categories,
                                        "Products"      => $products,
                                        "Blog"          => $posts
                                    ]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function About(Request $request){

        $content = Content::where(["slug" => "sobre", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["About" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Faq(Request $request){

        $content = Content::where(["slug" => "faq", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Faq" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Register(Request $request){

        $content = Content::where(["slug" => "account", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Account" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Partners(Request $request){ 

        $content = Content::where(["slug" => "parceiros", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $stores = Store::where(["status" => 1])
                           ->get();
                           
            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    [
                                        "Stores"    => Store::normalize($stores),
                                        "Partners"  => $content->setCustomContent()
                                    ]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function BecomePartner(Request $request){

        $content = Content::where(["slug" => "seja-parceiro", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Partner" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Blog(Request $request){

        $posts = Content::where(["type" => "blog", "status" => 1])
                        ->get();

        if($posts){

            foreach ($posts as $key => $post) {
                $posts[$key] = $post->setCustomContent();
            }

            $blog = Content::where(["slug" => "blog", "type" => "page"])
                           ->first();

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    [
                                        "Blog"  => $blog->setCustomContent(),
                                        "Posts" => $posts
                                    ]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Post(Request $request, $slug = NULL){

        $where = [
            "type"      => "blog",
            "status"    => 1
        ];

        if(!!$slug){
            $where["slug"] = $slug;

            $post = Content::where($where)->first();

            $related = Content::where(["type" => "blog", "status" => 1])
                              ->where("slug", "<>", $slug)
                              ->inRandomOrder()
                              ->limit(3)
                              ->get();

            foreach ($related as $key => $item) {
                $related[$key] = $item->setCustomContent();
            }

            if($post){
                return response()->json([
                    'response'  => true,
                    'data'      => array_merge(
                                        Content::getDefault(),
                                        [
                                            "Post"      => $post->setCustomContent(),
                                            "Related"   => $related
                                        ]
                                    )
                ]);
            }
        }
        else{

            $content = Content::where($where)->get();

            $slugs = $content->map(function($item) {
                return $item->slug;
            });

            return response()->json([
                'response'  => true,
                'data'      => $slugs
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Contact(Request $request){

        $content = Content::where(["slug" => "contato", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Contact" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Communicate(Request $request, $slug = NULL){

        $where = [
            "type" => "communicate"
        ];

        if(!!$slug){
            $where["slug"] = $slug;

            $content = Content::where($where)->first();

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Communicate" => $content->setCustomContent()]
                                )
            ]);
        }
        else{

            $content = Content::where($where)->get();

            $slugs = $content->map(function($item) {
                return $item->slug;
            });

            return response()->json([
                'response'  => true,
                'data'      => $slugs
            ]);
        }
    }

    public function Products(Request $request){

        $content = Content::where(["slug" => "produtos", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $data = array_merge(Content::getDefault(), [
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
        Log::info($request->all(),"aqui o log");
        
        $content = Content::where(["slug" => "produtos", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            $categories = Category::with(["childs"])
                                  ->where(["parent" => NULL])
                                  ->get();

            foreach ($categories as $key => $category) {
                $category->childs = Category::reduceLevel($category->childs);
            }

            $data = array_merge(Content::getDefault(), [
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

    public function Order(Request $request){

        $content = Content::where(["slug" => "email", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["mailContent" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Dashboard(Request $request){

        $content = Content::where(["slug" => "client-menu", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Dashboard" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Email(Request $request){

        $content = Content::where(["slug" => "email", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Email" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function Default(Request $request){
        return Content::getDefault(true);
    }

    public function AccountUser(Request $request){

        $content = Content::where(["slug" => "account", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Account" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function AccountAddress(Request $request){

        $content = Content::where(["slug" => "address", "type" => "page"])
                          ->first();

        if(isset($content->id)){

            return response()->json([
                'response'  => true,
                'data'      => array_merge(
                                    Content::getDefault(),
                                    ["Address" => $content->setCustomContent()]
                                )
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    // ADMIN
    public function GetListContent(Request $request){
        $pages = Content::where(["type" => "page"])
                        ->get();

        if($pages){
            foreach ($pages as $key => $post) {
                $pages[$key] = $post->setCustomContent();
            }

            return response()->json([
                'response'  => true,
                'data'      => $pages
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
