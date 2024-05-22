<?php

namespace App\Http\Controllers;

use DB;
use Image;
use Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Media;

class FileController extends Controller
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

	public function ListMedias(Request $request){

        $auth = Auth::user();

        $selecteds = $request->has('selecteds') ? $request->selecteds : [];

        $medias = Media::whereNotIn('id', $selecteds)
                        ->where(["application_id" => -1])
                        ->orderBy('id', 'DESC');

        if($auth->person != "master"){
            $medias = $medias->where('user_id', $this->user->id);
        }

        $medias = $medias->get()->toArray();

        $selecteds = Media::where('user_id', $this->user->id)
                    ->where(["application_id" => -1])
                    ->whereIn('id', $selecteds)
                    ->orderBy('id', 'DESC')
                    ->get()->toArray();

        $medias = $selecteds ? array_merge($selecteds, $medias) : $medias;

        foreach($medias as $key => $media){
            $medias[$key]['details'] = json_decode($media['details']);
        }

        return response()->json([
            'response'  => true,
            'auth' => $auth,
            'medias'    => $medias,
        ]);
	}

    public function RemoveMedias(Request $request){

        $request->validate([
            'medias'    => 'required'
        ]);

        $auth   = Auth::user();

        $files  = $request->get('medias');
        $medias = Media::whereIn('id', $files);

        if($request->has('app')){
            $medias = $medias->where('application_id', $request->get('app'));
        }
        else{
            $medias = $medias->where('user_id', $auth->id);
        }

        $medias = $medias->orderBy('id', 'DESC')
                         ->get();

        $feedback   = [];
        $removed    = [];

        foreach($medias as $key => $media){

            $has_error = false;

            foreach($media->RemoveMedia() as $md){
                if($md != true){

                    $has_error = true;
                    array_merge($feedback, $md);
                }
            }

            if(!$has_error){
                $removed[$media->id] = ['id' => $media->id, 'title' => $media->title];
            }
        }

        Media::whereIn('id', array_keys($removed))
             ->delete();

        return response()->json([
            'response'  => true,
            'medias'    => $medias,
            'removed'   => $removed,
            'feedback'  => $feedback
        ]);
    }

    public function UploadMedia(Request $request){

        $log = [];
        $mimes = explode(',', 'jpeg,jpg,JPG,JPEG,webp,bmp,png,gif,svg,pdf');

        $request->validate([
            'file' => 'required|file|image|mimes:'.implode(',', $mimes).'|max:6000'
        ]);

        DB::beginTransaction();

        $user           = Auth::user();
        $user->details  = json_decode($user->details);
        $app_id         = $user->details->app;
        $image_sizes    = config('image.image_sizes');
        $quality        = 100;

        if($request->hasFile('file')){

            $s3             = Storage::disk('s3');
            $uploads_path   = env('UPLOADS_S3') . '/' . $app_id . '/' . date('d-m-Y');

            $file               = $request->file('file');
            $original_filename  = $file->getClientOriginalName();

            $uniqid     = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyz"), 0, 5);
            $extension  = $file->extension();
            $filename   = ($extension != 'pdf') ? $uniqid.'-'.Str::slug($original_filename) : $original_filename;
            $filesize   = $file->getSize();

            if( in_array($extension, $mimes) ){
                if($filesize < 5000000){

                    $sizes          = [];
                    $default_image  = null;

                    if($extension == 'pdf'){

                        $path = $s3->put($uploads_path . '/' . $filename, file_get_contents($file->getRealPath()));
                        $path = $s3->url($path);

                        $sizes[] = [
                            'size' => '',
                            'path' => $uploads_path . '/' . $filename
                        ];
                    }
                    elseif($extension == 'gif' || $extension == 'svg'){

                        $path = $s3->put($uploads_path . '/' . $filename, file_get_contents($file->getRealPath()));
                        $path = $s3->url($path);

                        $sizes[] = [
                            'size' => $extension,
                            'path' => $uploads_path . '/' . $filename
                        ];
                    }
                    else{

                        foreach($image_sizes as $image_size){

                            $image = Image::make(file_get_contents($file->getRealPath()));

                            $size_with_filename = $image_size['name'] . '-' . $filename;

                            $image->resize($image_size['width'], null, function ($constraint) {
                                $constraint->aspectRatio();
                            });

                            $path = $s3->put($uploads_path . '/' . $size_with_filename, $image->stream());
                            $path = $s3->get($uploads_path . '/' . $size_with_filename);

                            $log[$uniqid] = $path;

                            $sizes[] = [
                                'size' => $image_size['name'],
                                'path' => $uploads_path . '/' . $size_with_filename
                            ];

                            if($image_size['default'])
                            {
                                $default_image = $size_with_filename;
                            }
                        }
                    }

                    $media                  = new Media();
                    $media->application_id  = $app_id;
                    $media->user_id         = $user->id;
                    $media->title           = $original_filename;
                    $media->slug            = $filename;
                    $media->base_url        = 'https://d1wd21ey9b0wqd.cloudfront.net/';
                    $media->description     = '';
                    $media->file_name       = $filename;
                    $media->file_size       = $filesize;
                    $media->path            = $uploads_path;
                    $media->permanent_url   = $uploads_path . '/' . $filename;
                    $media->extension       = $file->extension();
                    $media->details         = json_encode([
                                                            'sizes'         => $sizes,
                                                            'absolute_path' => $uploads_path
                                                        ]);
                    $media->permissions     = json_encode([]);
                    $media->type            = ($extension == 'pdf') ? 'file' : 'image';

                    if(!$media->save()){
                        DB::rollback();

                        return response()->json([
                            'response'  => false,
                            'message'   => 'Erro ao tentar salvar o arquivo.'
                        ], 500);
                    }
                }
                else{
                    DB::rollback();

                    return response()->json([
                        'response'  => false,
                        'message'   => 'O tamanho do arquivo "'.$original_filename.'" excede o valor máximo de 5mb para upload.'
                    ], 500);
                }
            }
            else{
                DB::rollback();

                return response()->json([
                    'response'  => false,
                    'log'       => in_array($extension, $mimes),
                    'message'   => 'O tipo do arquivo "'.$original_filename.'" não é permitido para upload.'
                ], 500);
            }
        }

        DB::commit();

        return response()->json([
            'response'  => true,
            'media'     => $media
        ]);
    }

    public function UploadFiles(Request $request){

        $request->validate([
            'index' => 'required',
            'medias' => 'required|array',
            'medias.*' => 'file|mimes:jpeg,png,jpg,gif,webp'
        ]);

        $dir    = $request->has('dir') ? $request->get('dir') : false;
        $index  = $request->index;
        $app    = $request->has('app') ? $request->get('app') : NULL;
        $files  = $request->file('medias');

        $user           = auth()->user();
        $image_sizes    = config('image.image_sizes');
        $quality        = 100;
        $max_width      = 1900;

        $s3 = Storage::disk('s3');

        $medias = [];
        $log    = [];

        foreach($files as $file) {
            if (in_array($file->getClientOriginalExtension(), ['jpeg', 'png', 'jpg', 'gif', 'webp'])) {
                $uploads_path  = env('UPLOADS_S3') . '/';
                $uploads_path .= !!$dir ? Str::slug($dir, '-') . '/' : NULL;
                $uploads_path .= $index . '/';
                $uploads_path .= date('d-m-Y') . '/';

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

                    if(!$media->save()){

                        foreach($image_sizes as $image_size){
                            $s3->delete($uploads_path . $image_size['name'] . '-' . $imageName.'.webp');
                        }

                        $feedback = [
                            'status' => false,
                            'media' => 'Erro ao enviar o arquivo: '.$imageTitle
                        ];
                    }
                    else{
                        $feedback = [
                            'status' => true,
                            'media' => $media
                        ];
                    }

                    array_push($medias, $feedback);
                }
            } else {
                $feedback = [
                    'status' => false,
                    'media' => 'Tipo de arquivo não suportado: ' . $file->getClientOriginalName()
                ];
                array_push($medias, $feedback);
            }
        }

        return response()->json([
            'response'  => true,
            'log'      => $log,
            'medias'    => $medias
        ]);
    }

    public function UploadBase64(Request $request){

        $request->validate([
            'index' => 'required',
            'medias' => 'required',
        ]);

        $dir    = $request->has('dir') ? $request->get('dir') : false;
        $index  = $request->index;
        $app    = $request->has('app') ? $request->get('app') : NULL;
        $files  = $request->get('medias');

        $user           = auth()->user();
        $image_sizes    = config('image.image_sizes');
        $quality        = 100;
        $max_width      = 1900;

        $s3 = Storage::disk('s3');

        $medias = [];
        $log    = [];

        foreach($files as $file) {
            $uploads_path  = env('UPLOADS_S3') . '/';
            $uploads_path .= !!$dir ? Str::slug($dir, '-') . '/' : NULL;
            $uploads_path .= $index . '/';
            $uploads_path .= date('d-m-Y') . '/';

            $image      = Image::make(file_get_contents($file['base64']));
            $imageTitle = $file['fileName'];
            $imageName  = rand(0, 3000).'-'.Str::slug($file['fileName'], '-');

            $split      = explode(',', substr( $file['base64'] , 5 ) , 2);
            $split      = explode(';', $split[0],2);
            $split      = explode('/', $split[0],2);
            $extension  = (isset($split[1])) ? $split[1] : '.webp';

            if(count($split) == 2){
                $extension = '.'.$extension;

                if($extension == '.jpeg') $extension = '.jpg';
            }

            $file_size      = (((int) (strlen(rtrim($file['base64'], '=')) * 3 / 4)) / 1024) / 1024;
            $width          = $image->width();
            $height         = $image->height();
            $resized_image  = ($width > $max_width) ? $image->resize($max_width, null, function ($img) {
                                    $img->aspectRatio();
                                })->stream('webp', $quality) : $image->stream('webp', $quality);

            if($s3->put($uploads_path . $imageName.'.webp', $resized_image)){

                $sizes = ['default' => $uploads_path . $imageName.'.webp'];

                $image_sizes = config('image.image_sizes');
                foreach($image_sizes as $image_size){

                    $size_with_filename = $image_size['name'] . '-' . $imageName.'.webp';

                    $make       = Image::make(file_get_contents($file['base64']));
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
                $media->type            = ($extension == '.pdf') ? 'file' : 'image';

                if(!$media->save()){

                    foreach($image_sizes as $image_size){
                        $s3->delete($uploads_path . $image_size['name'] . '-' . $imageName.'.webp');
                    }

                    $feedback = [
                        'status' => false,
                        'media' => 'Erro ao enviar o arquivo: '.$imageTitle
                    ];
                }
                else{
                    $feedback = [
                        'status' => true,
                        'media' => $media
                    ];
                }

                array_push($medias, $feedback);
            }
        }

        return response()->json([
            'response'  => true,
            'log'      => $log,
            'medias'    => $medias
        ]);
    }
}
