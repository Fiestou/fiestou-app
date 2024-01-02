<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Support\Facades\Storage;

class Media extends BaseModel
{
    protected $table = 'media';
    protected $fillable = [
        'id',
        'application_id',
        'user_id',
        'media_id',
        'title',
        'slug',
        'description',
        'file_name',
        'file_size',
        'path',
        'permanent_url',
        'extension',
        'details',
        'permissions',
        'type'
    ];

    public function RemoveMedia()
    {
        $response = [];

        if($this->extension == 'gif' || $this->extension == 'pdf' || $this->extension == 'svg'){
            array_push($response, $this->ApplyRemove());
        }
        else{
            $details = json_decode($this->details);

            foreach($details->sizes as $file){
                array_push($response, $this->ApplyRemove($file));
            }
        }

        return $response;
    }

    public function ApplyRemove($file = NULL){

        try{

            $disk = Storage::disk('s3');

            if($disk->exists($file)){

                if($disk->delete($file)){
                    return true;
                }
                else{
                    return $this->file_name.': error - '.$file;
                }
            }
            else{
                return true;
            }

        }
        catch(Exception $e){
            return $this->file_name.': error - '.$e->getMessage();
        }
    }
}
