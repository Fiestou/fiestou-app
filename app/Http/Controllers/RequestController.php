<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use Image;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Content;
use App\Models\ContentRel;
use App\Models\Media;
use Illuminate\Support\Str;

class RequestController extends Controller
{
    public function Graph(Request $request){

        $request->validate([
            'graphs' => 'required'
        ]);

        $content = new Content();
        $data = $content->GraphRequest($request->graphs);

        return response()->json([
            'response'  => true,
            'data'      => $data
        ]);
    }

    public function GraphRequestOld(Request $request){

        $request->validate([
            'graph_request' => 'required'
        ]);

        $contents = [];
        $graphs = [$request->graph_request];

        foreach($graphs as $graph){

            $result = [];

            if(isset($graph['model'])){

                $model = trim($graph['model']);
                $column = $model;

                if(strpos($model, ' as ') !== false){
                    $explode = explode(' as ', $model);
                    $model = $explode[0];
                    $column = $explode[1];
                }

                $where['type'] = $model;

                $result = Content::where($where);

                if(isset($where['with'])){
                    $result = $result->with($where['with']);
                }

                if(isset($graph['where'])){
                    foreach($graph['where'] as $query){
                        $result = Content::HandleQuery($query, $result);
                    }
                }

                $result = $result->get();

                if($result){
                    foreach($result as $item){
                        $item->column = $column;
                        array_push($contents, $item);
                    }
                }

                $data[$column] = $result;
            }
        }

        $data = Content::GraphResultClear($contents, $data);

        return response()->json([
            'response'  => true,
            'data' => $data
        ]);
    }
}
