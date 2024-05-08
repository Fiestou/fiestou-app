<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use App\Models\CategoryRel;
use Illuminate\Support\Str;
use App\Models\Media;
use DB;

class Category extends BaseModel
{
    protected $table = 'category';
    protected $fillable = [
        "id",
        "parent",
        "closest",
        "order",
        "title",
        "slug",
        "feature",
        "image",
        "text",
        "multiple",
        "status",
        "created_at",
        "updated_at"
    ];

    public function childs(){
        return $this->child()->with(['childs']);
    }

    public function child(){
        return $this->hasMany(Category::class, 'parent', 'id')->orderBy('category.order', 'ASC')->orderBy('category.id', 'DESC');
    }

    public static function reorderApply($list){

        foreach ($list as $key => $item) {
            $category = Category::where(['id' => $item['id']])->first();
            $category->order = $key;

            if(isset($item['childs']) && !!$item['childs']){
                Category::reorderApply($item['childs']);
            }

            $category->save();
        }
    }

    public static function parents($parent, $parents = []){
        $handle = Category::select(["id", "parent"])
                          ->where("id", $parent)
                          ->first();

        if(isset($handle->id)){
            $parents[] = $handle->id;

            if($handle->parent){
                $parents = Category::parents($handle->parent, $parents);
            }
        }

        return $parents;
    }

    public static function reduceLevel($childs, $level = []){

        if(!count($childs)) return [];

        foreach($childs as $child){
            $level[] = $child;

            if($child->$childs){
                $level = Category::reduceLevel($child->$childs, $level);
            }
        }

        return $level;
    }

    public static function normalize($categories = []){
        if(!empty($categories)){
            foreach ($categories as $key => $category) {

                $category->closest   = !!$category->closest  ? json_decode($category->closest) : [];
                $category->metadata  = !!$category->metadata ? json_decode($category->metadata) : [];
                $category->image     = !!$category->image    ? Media::where('id', $category->image)->first() : [];

                if(!!$category->image){
                    $category->image->details = !!$category->image->details ? json_decode($category->image->details) : [];

                    $category->image = ["medias" => [$category->image]];
                }

                if(isset($category->childs) && !empty($category->childs)){
                    $category->childs = Category::normalize($category->childs);
                }
            }

            return $categories;
        }

        return [];
    }

    public function deleteChilds($childs){
        foreach($childs as $category){
            if(isset($category->childs) && !!$category->childs){
                $category->deleteChilds($category->childs);
            }

            $categoryRel = CategoryRel::where(['category' => $category->id])
                                        ->delete();

            $category->delete();
        }
    }
}
