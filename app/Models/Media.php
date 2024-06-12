<?php

namespace App\Models;

use Image;
use App\Models\BaseModel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    public static function normalizeMedia($medias = []){

        $mediaList = Media::whereIn("id", $medias)->get();

        foreach ($mediaList as $key => $media) {
            $media->details = json_decode($media->details);
        }

        return $mediaList;
    }

    public static function MakeUpload($files, $path = NULL, $app = NULL){

        $medias = [];

        $user           = auth()->user();
        $image_sizes    = config('image.image_sizes');
        $quality        = 100;
        $max_width      = 1900;

        $s3 = Storage::disk('s3');

        $medias = [];
        $log    = [];

        foreach($files as $file) {

            $uploads_path  = env('UPLOADS_S3') . $path;

            $image      = Image::make($file->getRealPath());
            $imageTitle = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $imageName  = rand(0, 3000).'-'.Str::slug($imageTitle, '-');
            $extension  = '.webp';

            $file_size  = $file->getSize() / 1024 / 1024; // Convert bytes to MB
            $width      = $image->width();
            $height     = $image->height();
            $resized_image  = ($width > $max_width) ? $image->resize($max_width, null, function ($img) {
                                    $img->aspectRatio();
                                })->stream('webp', $quality) : $image->stream('webp', $quality);

            if($s3->put($uploads_path . $imageName.'.webp', $resized_image)){

                $sizes = ['default' => $uploads_path . $imageName.'.webp'];

                foreach($image_sizes as $image_size){

                    $size_with_filename = $image_size['name'] . '-' . $imageName.'.webp';

                    $make       = Image::make($file->getRealPath());
                    $max_width  = $image_size['width'];
                    $resized    = ($width > $max_width) ? $make->resize($max_width, null, function ($img) {
                                        $img->aspectRatio();
                                    })->stream('webp', $quality) : $make->stream('webp', $quality);

                    $path = $s3->put($uploads_path . $size_with_filename, $resized);
                    $path = $s3->get($uploads_path . $size_with_filename);

                    $sizes[$image_size['name']] = $uploads_path . $size_with_filename;
                }

                $media                  = new Media();
                $media->application_id  = $app;
                $media->user_id         = $user->id;
                $media->title           = $imageTitle;
                $media->slug            = $imageName;
                $media->base_url        = 'https://d3hwvozn85ys0n.cloudfront.net/';
                $media->description     = '';
                $media->file_name       = $imageTitle.'.webp';
                $media->file_size       = $file_size;
                $media->path            = $uploads_path;
                $media->permanent_url   = $uploads_path . $imageName.'.webp';
                $media->extension       = '.webp';
                $media->details         = json_encode(['sizes' => $sizes]);
                $media->permissions     = json_encode([]);
                $media->type            = 'image';

                if($media->save()){
                    $medias[] = $media;
                }
                else{
                    foreach($image_sizes as $image_size){
                        $s3->delete($uploads_path . $image_size['name'] . '-' . $imageName.'.webp');
                    }
                }
            }
        }

        return $medias;
    }

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

    public static function GetImage($image, $size = 'lg')
    {
        if (empty($image)) {
            return "";
        }

        if (!empty($image->medias)) {
            $image = $image->medias;
        }

        if (is_array($image)) {
            $img = !empty($image[0]) ? $image[0] : false;
        } else {
            $img = $image;
        }

        if (!!$img && !empty($img->base_url) && !empty($img->details->sizes)) {
            $url = $img->base_url . (!empty($size) ? $img->details->sizes->$size : $img->details->sizes->lg);

            return trim($url) != trim($img->base_url) ? $url : "";
        }

        return "";
    }
}
