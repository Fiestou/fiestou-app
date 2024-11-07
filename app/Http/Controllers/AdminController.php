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

class AdminController extends Controller
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

    public function ListContent(Request $request){

        $request->validate([
            'type'   => 'required'
        ]);

        $contents = Content::where(["type" => $request->get('type')]);

        if ($request->has('orderBy')) {
            list($field, $direction) = explode(' ', $request->get('orderBy'));
        
            if (in_array(strtolower($direction), ['asc', 'desc'])) {
                $contents = $contents->orderBy($field, $direction);
            }
        }

        $contents = $contents->get();

        if($contents){

            $data = [];

            foreach ($contents as $key => $content) {
                $data[] = $content->setCustomContent();
            }

            return response()->json([
                'response'  => true,
                'data'      => $data
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function GetContent(Request $request){

        $request->validate([
            'type'   => 'required',
        ]);

        if($request->has('slug')){
            $content = Content::where([
                                    "type"  => $request->get('type'),
                                    "slug"  => $request->get('slug')
                                ])
                                ->first();
        }
        else if($request->has('id')){
            $content = Content::where([
                                    "type"  => $request->get('type'),
                                    "id"    => $request->get('id')
                                ])
                                ->first();
        }

        if($content){
            return response()->json([
                'response'  => true,
                'data'      => $content->setCustomContent()
            ]);
        }

        return response()->json([
            'response'  => false
        ]);
    }

    public function RegisterContent(Request $request){

        $request->validate([
            'type'  => 'required',
            'title' => 'required',
        ]);
    
        if($request->has('id')){
            $content = Content::where([
                                    "type"  => $request->get('type'),
                                    "id"    => $request->get('id')
                                ])
                                ->first();
        }
        else if($request->has('slug')){
            $content = Content::where([
                                    "type"  => $request->get('type'),
                                    "slug"  => $request->get('slug')
                                ])
                                ->first();
        }
    
        if (!$content) {
            $content = new Content;
        }

        $content->type      = $request->get('type');
        $content->title     = $request->get('title');
        $content->slug      = (isset($content->slug) && !!$content->slug) ? Str::slug(strip_tags($content->slug)) : Str::slug(strip_tags($content->title));
        $content->status    = !!$request->get('status');
    
        $content->ContentCustom($request->get('content'));
    
        if ($content->save()) {
            return response()->json([
                'response'  => true,
                'data'      => $content->setCustomContent()
            ]);
        }
    
        return response()->json([
            'response'  => false
        ]);
    }    

    public function RemoveContent(Request $request){

        $request->validate([
            'remove' => 'required',
        ]);

        $contents_id = (is_array($request->get('remove'))) ? $request->get('remove') : [$request->get('remove')];

        $contents = Content::whereIn('id', $contents_id)->delete();

        return response()->json([
            'response'  => true
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
