<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\CronController;
use App\Http\Controllers\MailController;

use App\Http\Controllers\WithdrawController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SubordersController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\StoresController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\CategoriesController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// OPEN
Route::get('/user-active', [AuthController::class, 'ActiveUser']);
Route::post('/mail-send', [MailController::class, 'MailSend']);

// AUTH
Route::group(['prefix' => 'app', 'middleware' => 'api'], function ($router) {

    //AUTHCONTROLLER
    Route::group([ 'prefix' => 'auth' ], function(){
        Route::post('/checkin', [AuthController::class, 'CheckIn']);
        Route::post('/login', [AuthController::class, 'Login']);
        Route::post('/register', [UsersController::class, 'Register']);
        Route::post('/pre-register', [UsersController::class, 'PreRegister']);
        Route::post('/recovery', [AuthController::class, 'Recovery']);
    });

    //USERSCONTROLLER
    Route::get('/validate-mail-token/{token}', [UsersController::class, 'ValidateMailToken']);
    Route::post('/complete-this-register', [UsersController::class, 'CompleteThisRegister']);
    Route::post('/try-to-restore-the-password', [UsersController::class, 'TryToRestoreThePassword']);
    Route::post('/restore-the-password', [UsersController::class, 'RestoreThePassword']);
    Route::post('/validate-and-change-my-email', [UsersController::class, 'ValidateAndChangeMyEmail']);

    Route::group(['middleware' => 'jwt.auth'],function(){

        // ORDERS
        Route::post('/orders/list', [OrdersController::class, 'List']);
        Route::post('/orders/get', [OrdersController::class, 'Get']);
        Route::post('/orders/register', [OrdersController::class, 'Register']);
        Route::post('/orders/register-meta', [OrdersController::class, 'RegisterMeta']);

        // SUBORDERS
        Route::post('/suborders/list', [SubordersController::class, 'List']);
        Route::post('/suborders/get', [SubordersController::class, 'Get']);
        Route::post('/suborders/register', [SubordersController::class, 'Register']);

        // CATEGORIES
        Route::post('/categories/list', [CategoriesController::class, 'List']);
        Route::post('/categories/get', [CategoriesController::class, 'Get']);
        Route::post('/categories/register', [CategoriesController::class, 'Register']);
        Route::post('/categories/remove', [CategoriesController::class, 'Remove']);

        // COMMENTS
        Route::post('/comments/list', [CommentsController::class, 'List']);
        Route::post('/comments/register', [CommentsController::class, 'Register']);

        // PRODUCTS
        Route::post('/products/form', [ProductsController::class, 'Form']);
        Route::post('/products/register', [ProductsController::class, 'Register']);
        Route::post('/products/remove', [ProductsController::class, 'Remove']);

        // STORES
        Route::post('/stores/get', [StoresController::class, 'Get']);
        Route::post('/stores/form', [StoresController::class, 'Form']);
        Route::post('/stores/balance', [StoresController::class, 'Balance']);
        Route::post('/stores/customers', [StoresController::class, 'Customers']);
        Route::post('/stores/register', [StoresController::class, 'Register']);
        Route::post('/stores/remove', [StoresController::class, 'Remove']);

        // WITHDRAW
        Route::post('/withdraw/get', [WithdrawController::class, 'Get']);
        Route::post('/withdraw/register', [WithdrawController::class, 'Register']);
        Route::post('/withdraw/list', [WithdrawController::class, 'List']);

        //AUTHCONTROLLER
        Route::post('/logout', [AuthController::class, 'Logout']);
        Route::post('/refresh', [AuthController::class, 'Refresh']);
        Route::post('/me', [AuthController::class, 'Me']);

        Route::group([ 'prefix' => 'users' ], function(){
            Route::post('/update', [UsersController::class, 'Update']);
            Route::post('/get', [UsersController::class, 'GetUser']);
            Route::post('/list', [UsersController::class, 'ListUser']);
            Route::post('/validate', [AuthController::class, 'ValidateUser']);
            Route::post('/set-relationship', [UsersController::class, 'SetRelationship']);
            Route::post('/get-relationship', [UsersController::class, 'GetRelationship']);
        });

        Route::group([ 'prefix' => 'content' ], function(){
            Route::post('/register-content', [ContentController::class, 'RegisterContent']);
            Route::post('/get-content', [ContentController::class, 'GetContent']);
            Route::post('/graph', [ContentController::class, 'Graph']);
            Route::post('/get-list-content', [ContentController::class, 'GetListContent']);
            Route::post('/remove-content', [ContentController::class, 'RemoveContent']);
            Route::post('/reorder-content', [ContentController::class, 'ReorderContent']);
        });

        Route::group([ 'prefix' => 'files' ], function(){
            Route::post('/list-medias', [FileController::class, 'ListMedias']);
            Route::post('/remove-medias', [FileController::class, 'RemoveMedias']);
            Route::post('/upload-media', [FileController::class, 'UploadMedia']);
            Route::post('/upload-base64', [FileController::class, 'UploadBase64']);
        });
    });
});

// CRON
Route::group([ 'prefix' => 'cron' ], function(){
    Route::get('/normalize-file-data', [CronController::class, 'NormalizeFileData']);
    Route::get('/migrate', [CronController::class, 'MigrateData']);
});

// CONTENT
Route::group([ 'prefix' => 'content' ], function(){
    Route::post('/default', [ContentController::class, 'Default']);
    Route::post('/home', [ContentController::class, 'Home']);
    Route::post('/products', [ContentController::class, 'Products']);
    Route::post('/product', [ContentController::class, 'Product']);
});

// REST / GRAPH
Route::group([ 'prefix' => 'request' ], function(){
    Route::post('/graph', [RequestController::class, 'Graph']);
    Route::post('/products', [ProductsController::class, 'List']);
    Route::post('/product', [ProductsController::class, 'Get']);
    Route::post('/stores', [StoresController::class, 'List']);
    Route::post('/store', [StoresController::class, 'Get']);
    Route::post('/categories', [CategoriesController::class, 'List']);
    Route::post('/categories-paths', [CategoriesController::class, 'Paths']);
    Route::post('/category', [CategoriesController::class, 'Get']);
});

