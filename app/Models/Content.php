<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\ContentRel;
use Illuminate\Support\Str;
use DB;

class Content extends BaseModel
{
    public $log = [];
    protected $table = 'content';
    protected $fillable = [
        'id',
        'user_id',
        'parent_id',
        'title',
        'slug',
        'content',
        'featured',
        'views',
        'trash',
        'order',
        'type',
        'status',
    ];

    public function ContentCustom($request){

        $content = [];

        foreach ($request as $key => $value){
            if(!in_array($key, $this->fillable) && $key != "id"){
                $content[$key] = $value;
            }
        }

        if(isset($content['model']))        unset($content['model']);
        if(isset($content['method']))       unset($content['method']);
        if(isset($content['updated_at']))   unset($content['updated_at']);
        if(isset($content['created_at']))   unset($content['created_at']);

        $this->content = json_encode($content);

        return $this->content;
    }

    public static function GraphResultClear($contents, $data = []){
        if(!is_string($contents)){
            $contents = json_decode(json_encode($contents), TRUE);

            foreach($contents as $key => $item){
                $model = $item['type'];
                $column = isset($item['column']) ? $item['column'] : $model;

                // unset($item['childs']);
                unset($item['type']);
                unset($item['details']);
                unset($item['user_id']);
                unset($item['order']);
                unset($item['trash']);
                unset($item['views']);
                // unset($item['status']);
                unset($item['featured']);
                unset($item['column']);
                // unset($item['parent_id']);
                // unset($item['updated_at']);
                // unset($item['created_at']);

                if(!isset($data[ $column ])) $data[ $column ] = [];

                // Qualquer conteúdo filho existente em contents vem de algum sublista, por isso é necessário reorganizar em cadeia qualquer sub-conteúdo
                if(isset($item['child']) && !!count($item['child'])){
                    $item['child'] = Content::GraphResultClear($item['child']);
                }

                if(isset($item['childs']) && !!count($item['childs'])){
                    $item['childs'] = Content::GraphResultClear($item['childs']);
                }

                if(isset($item['parent']) && !!count($item['parent'])){
                    $item['parent'] = Content::GraphResultClear($item['parent']);
                }

                if(isset($item['parents']) && !!count($item['parents'])){
                    $item['parents'] = Content::GraphResultClear($item['parents']);
                }
                // --

                // Sobe o nível dos itens dentro de content pra virarem valor do próprio $content
                if(isset($item['content']) && $item['content']){

                    $item['content'] = json_decode($item['content'], TRUE);

                    $fields = array_keys($item['content']);

                    foreach($fields as $field){
                        $item[$field] = $item['content'][$field];
                    }

                    unset($item['content']);
                }

                array_push($data[ $column ], $item);
            }
        }

        return $data;
    }

    public function GraphRequest($graphs = [], $auth = false){
        $auth = $auth ? $auth : json_decode(json_encode([]));

        $register   = [];
        $delete     = [];
        $query      = [];

        foreach($graphs as $graph){
            if(isset($graph['model'])){
                $where = [];

                $model = trim($graph['model']);
                $column = $model;

                if(strpos($model, ' as ') !== false){
                    $explode = explode(' as ', $model);
                    $model = $explode[0];
                    $column = $explode[1];
                }

                $method = isset($graph['method']) ? $graph['method'] : 'query';

                if($method == 'query'){

                    $where['type'] = $model;

                    if(isset($graph['id']) && !!$graph['id']){
                        $where['id'] = (int) $graph['id'];
                    }
                    else if(isset($graph['slug']) && !!$graph['slug']){
                        $where['slug'] = $graph['slug'];
                    }

                    $result = Content::where($where);

                    if(isset($graph['orderBy'])){
                        $result = $result->orderByRaw($graph['orderBy']);
                    }
                    else{
                        $result = $result->orderByDesc('created_at');
                    }

                    if(isset($graph['offset'])){
                        $result = $result->offset($graph['offset']);
                    }

                    if(isset($graph['limit'])){
                        $result = $result->limit($graph['limit']);
                    }

                    if(isset($graph['with'])){

                        if(isset($graph['with']['parent'])){
                            $result = $result->with(["parent" => function($qry) use ($graph){
                                $qry->where(['type' => $graph['with']['parent']]);
                            }]);
                        }

                        if(isset($graph['with']['parents'])){
                            $parents = $graph['with']['parents'];
                            $result = $result->with(["parents" => function($qry) use ($parents){
                                $qry->whereIn('type', is_array($parents) ? $parents : [$parents]);
                            }]);
                        }

                        if(isset($graph['with']['child'])){

                            $result = $result->with(["child" => function($qry) use ($graph){
                                $qry->where(['type' => $graph['with']['child']]);
                            }]);
                        }

                        if(isset($graph['with']['childs'])){
                            $childs = $graph['with']['childs'];
                            $result = $result->with(["childs" => function($qry) use ($childs){
                                $qry->whereIn('type', is_array($childs) ? $childs : [$childs]);
                            }]);
                        }
                    }

                    if(isset($graph['relationship']) && !!$graph['relationship']){

                        $value  = [];
                        $relationType = $graph['relationship']['relation'] ?? "whereIn";
                        $col    = isset($graph['relationship']['secondary']) ? "secondary_content_id" : "main_content_id";
                        $pluck  = isset($graph['relationship']['secondary']) ? "main_content_id" : "secondary_content_id";

                        if(isset($graph['relationship']['secondary'])){
                            $value = $graph['relationship']['secondary'];
                        }
                        else if(isset($graph['relationship']['main'])){
                            $value = $graph['relationship']['main'];
                        }

                        $value = is_array($value) ? $value : [$value];
                        $value = Arr::flatten($value);

                        if(isset($graph['relationship']['key']) && $graph['relationship']['key'] == "slug"){
                            $value = Content::whereIn("slug", $value)->pluck("id");
                        }

                        $relContent = ContentRel::whereIn($col, $value)
                                                ->orderBy('order', 'DESC')
                                                ->pluck($pluck);

                        $relContent = json_decode(json_encode($relContent, TRUE));

                        $relFilter = [
                            "relation" => $relationType,
                            "key" => "id",
                            "value" => is_array($relContent) ? $relContent : [$relContent],
                        ];

                        if(!isset($graph['filter'])) $graph['filter'] = [];

                        array_push($graph['filter'], $relFilter);
                    }

                    if(isset($graph['filter'])){
                        foreach($graph['filter'] as $ftr){
                            $result = $this->HandleFilter($ftr, $result);
                        }
                    }

                    if(isset($graph['groupBy'])){
                        $result = $result->groupBy($graph['groupBy']);
                    }

                    $result = $result->get();

                    if($result){
                        foreach($result as $item){
                            $item->column = $column;
                            array_push($query, $item);
                        }
                    }
                }

                if($method == 'register' && !!$auth){
                    $content = new Content;

                    $graph['type'] = $graph['model'];

                    if(isset($graph['id']) && !!$graph['id']){
                        $where['id'] = (int) $graph['id'];
                    }
                    else if(isset($graph['slug']) && !!$graph['slug']){
                        $where['slug'] = $graph['slug'];
                    }

                    if(isset($where['slug']) || isset($where['id'])){
                        $where['type']      = $graph['model'];

                        if(isset($graph['scape']) && is_array($graph['scape'])){
                            foreach($graph['scape'] as $scape){
                                if(isset($where[$scape])) unset($where[$scape]);
                                if(isset($graph[$scape])) unset($graph[$scape]);
                            }
                        }

                        $result = Content::where($where);
                        $this->log[] = $where;

                        if(isset($graph['filter'])){
                            foreach($graph['filter'] as $ftr){
                                $result = $this->HandleFilter($ftr, $result);
                            }
                        }

                        $result = $result->first();

                        if(isset($result->id)){
                            $content = $result;
                        }
                    }

                    $content->RequestToThis($graph);

                    if(isset($graph['content']) && $graph['content']) $content->ContentCustom($graph['content']);

                    $content->title = (isset($graph['title']) && !empty($graph['title'])) ? strip_tags($graph['title']) : 'content-'.uniqid();
                    $content->slug  = (isset($graph['slug']) && !empty($graph['slug'])) ? Str::slug(strip_tags($graph['slug'])) : Str::slug(strip_tags($content->title));

                    $content->type = $graph['model'];

                    DB::beginTransaction();

                    if($content->save()) {

                        if(!!ContentRel::where([ 'main_content_id' => $content->id ])->count()){
                            ContentRel::where([ 'main_content_id' => $content->id ])->delete();
                        }

                        if(isset($graph['relationship']) && !!$graph['relationship']){

                            $relationship = is_array($graph['relationship']) ? $graph['relationship'] : [$graph['relationship']];
                            $relationship = array_map('intval', $relationship);
                            $relationship = Content::whereIn("id", $relationship)->get();

                            foreach($relationship as $rel){
                                $contentRel = new ContentRel;
                                $contentRel->main_content_id = $content->id;
                                $contentRel->secondary_content_id = $rel->id;
                                $contentRel->type = $content->type.'_'.$rel->type;
                                $contentRel->save();
                            }
                        }

                        if(isset($graph['then']) && !!$graph['then'] && is_array($graph['then'])){

                            $use        = ["last.id", "last.model", "last.parent_id","last.title","last.status","last.content","last.slug"];
                            $replace    = [$content->id, $content->type, $content->parent_id, $content->title, $content->status, $content->content, $content->slug];

                            $handleThen = json_encode($graph['then']);
                            $handleThen = str_replace($use, $replace, $handleThen);
                            $handleThen = json_decode($handleThen, TRUE);

                            $content->then = $this->GraphRequest($handleThen, $auth);
                        }
                    }
                    else{
                        DB::rollback();
                        array_push($register, "Erro ao salvar o item ".$content->title);
                    }

                    DB::commit();

                    $content->column = $column;
                    array_push($register, $content);
                }

                if($method == 'delete' && !!$auth && (isset($graph['id']) || isset($graph['slug']))){

                    $where['type'] = $graph['model'];

                    if(isset($graph['parent_id']) && $graph['parent_id']){
                        $where['parent_id'] = (int) $graph['parent_id'];
                    }

                    if(isset($graph['id'])){
                        $where['id'] = !!$graph['id'] ? (int) $graph['id'] : 0;
                    }

                    if(isset($graph['slug'])){
                        $where['slug'] = !!$graph['slug'] ? $graph['slug'] : "";
                    }

                    $result = Content::where($where);

                    if(isset($graph['filter'])){
                        foreach($graph['filter'] as $ftr){
                            $result = $this->HandleFilter($ftr, $result);
                        }
                    }

                    $result = $result->get();

                    if($result){
                        foreach($result as $content){
                            $delete = $content->DeleteContent($delete);
                        }
                    }
                }
            }
        }

        $return = [];

        if($query){
            $return['query'] = Content::GraphResultClear($query);
        }

        if($register){
            $return['register'] = (!!$auth) ? Content::GraphResultClear($register) : "Permissão de registro negada";
        }

        if($delete){
            $return['delete'] = (!!$auth) ? $delete : "Permissão de registro negada";
        }

        $return['log'] = $this->log;

        return $return;
    }

    public function HandleFilter($query, $result){

        if(isset($query['query'])){
            foreach($query['group'] as $group){

                $relation = $group['relation'] ?? 'where';

                $result = $result->{$relation}(function ($subquery, $group) {
                    return $this->HandleFilter($group, $subquery);
                });
            }
        }
        else{

            $column = false;
            $relation = $query['relation'] ?? 'where';

            if(isset($query['key'])){
                $reserved = ['title', 'slug', 'id', 'parent_id', 'user_id'];
                $column = in_array($query['key'], $reserved) ?  $query['key'] : 'content->'.$query['key'];
            }

            if(isset($query['value'])){
                if(is_string($query['value'])) $query['value'] = trim($query['value']);

                $value =  $query['value'];

                if(isset($query['compare']) && $query['compare'] == 'like'){
                    $value = DB::raw("'%".strtolower($query['value'])."%' COLLATE utf8mb4_general_ci");
                }
            }

            if(!!$column && isset($value)){
                $result = isset($query['compare']) ? $result->{$relation}($column, $query['compare'], $value) : $result->{$relation}($column, $value);
            }
        }

        return $result;
    }

    public function setCustomContent(){

        $this->content = ($this->content) ? json_decode($this->content) : [];

        if($this->childs){
            foreach($this->childs as $key => $child){
                $this->childs[$key] = $child->setCustomContent();
            }
        }

        foreach($this->content as $key => $item){
            if(!in_array($key, $this->fillable) || $key == 'title'){
                $this->{$key} = $item;
            }
        }

        unset($this->content);

        return $this;
    }

    public function childs(){
        return $this->child()->with(['childs']);
    }

    public function child(){
        return $this->hasMany(Content::class, 'parent_id', 'id')->orderBy('content.order', 'ASC')->orderBy('content.id', 'DESC');
    }

    public function parents(){
        return $this->parent()->with(['parents']);
    }

    public function parent(){
        return $this->hasMany(Content::class, 'id', 'parent_id')->orderBy('content.order', 'ASC')->orderBy('content.id', 'DESC');
    }

    public function DeleteContent($data = []){

        ContentRel::where(['main_content_id' => $this->id])
                  ->orWhere(['secondary_content_id' => $this->id])
                  ->delete();

        $childs = Content::where(['parent_id' => $this->id])->get();

        $removedChilds = [];

        if($childs){
            foreach($childs as $key => $child){
                $removedChilds = $child->DeleteContent($removedChilds);
            }
        }

        $removed = [
            "id" => $this->id,
            "title" => $this->title,
            "status" => "removed"
        ];

        if(!$this->delete()){
            $removed["status"] = "Erro ao remover";
        }

        if(!!count($removedChilds)){
            $removed["childs"] = $removedChilds;
        }

        $data[ $removed['id'] ] = $removed;

        return $data;
    }
}







