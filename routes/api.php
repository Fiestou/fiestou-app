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
use App\Http\Controllers\SmsController;
use App\Http\Controllers\HooksController;

use App\Http\Controllers\WithdrawController;
use App\Http\Controllers\OrdersController;
use App\Http\Controllers\SubordersController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\StoresController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GroupController;


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
Route::post('/sms-send', [SMSController::class, 'SendSMS']);

// AUTH
Route::group(['prefix' => 'app', 'middleware' => 'api'], function ($router) {

    //AUTHCONTROLLER
    Route::group([ 'prefix' => 'auth' ], function(){
        Route::post('/checkin', [AuthController::class, 'CheckIn']);
        Route::post('/login', [AuthController::class, 'Login']);
        Route::post('/external-auth', [AuthController::class, 'ExternalAuth']);
        Route::post('/register', [UsersController::class, 'Register']);
        Route::post('/pre-register', [UsersController::class, 'PreRegister']);
        Route::post('/recovery', [AuthController::class, 'Recovery']);
        Route::post('/redefine', [AuthController::class, 'Redefine']);
    });

    //STORESCONTROLLER
    Route::group([ 'prefix' => 'stores' ], function(){
        Route::post('/complete-register', [StoresController::class, 'CompleteRegister']);
    });

    Route::group(['middleware' => 'jwt.auth'],function(){

        // ORDERS
        Route::post('/orders/list', [OrdersController::class, 'List']);
        Route::post('/orders/get', [OrdersController::class, 'Get']);
        Route::post('/orders/register', [OrdersController::class, 'Register']);
        Route::post('/orders/register-meta', [OrdersController::class, 'RegisterMeta']);
        Route::post('/orders/processing', [OrdersController::class, 'Processing']);

        // SUBORDERS
        Route::post('/suborders/list', [SubordersController::class, 'List']);
        Route::post('/suborders/get', [SubordersController::class, 'Get']);
        Route::post('/suborders/register', [SubordersController::class, 'Register']);

        // CATEGORIES
        Route::post('/categories/list', [CategoriesController::class, 'List']);
        Route::post('/categories/get', [CategoriesController::class, 'Get']);
        Route::post('/categories/reorder', [CategoriesController::class, 'Reorder']);
        Route::post('/categories/register', [CategoriesController::class, 'Register']);
        Route::post('/categories/remove', [CategoriesController::class, 'Remove']);

        // COMMENTS
        Route::post('/comments/list', [CommentsController::class, 'List']);
        Route::post('/comments/register', [CommentsController::class, 'Register']);

        // PRODUCTS
        Route::post('/products/form', [ProductsController::class, 'Form']);
        Route::post('/products/register', [ProductsController::class, 'Register']);
        Route::post('/products/remove', [ProductsController::class, 'Remove']);
        Route::get('/products/gallery/{id}', [ProductsController::class, 'GetGallery']);
        Route::post('/products/remove-gallery', [ProductsController::class, 'RemoveGallery']);
        Route::post('/products/upload-gallery', [ProductsController::class, 'UploadGallery']);

        // STORES
        Route::post('/stores/get', [StoresController::class, 'Get']);
        Route::post('/stores/form', [StoresController::class, 'Form']);
        Route::post('/stores/balance', [StoresController::class, 'Balance']);
        Route::post('/stores/customers', [StoresController::class, 'Customers']);
        Route::post('/stores/register', [StoresController::class, 'Register']);
        Route::post('/stores/remove', [StoresController::class, 'Remove']);
        Route::get('/stores/products', [StoresController::class, 'Products']);

        // WITHDRAW
        Route::post('/withdraw/get', [WithdrawController::class, 'Get']);
        Route::post('/withdraw/register', [WithdrawController::class, 'Register']);
        Route::post('/withdraw/update', [WithdrawController::class, 'update']);
        Route::post('/withdraw/list', [WithdrawController::class, 'List']);

        // CHECKOUT
        Route::post('/checkout/create', [CheckoutController::class, 'Create']);

        //AUTHCONTROLLER
        Route::post('/refresh', [AuthController::class, 'Refresh']);
        Route::post('/me', [AuthController::class, 'Me']);

        Route::group([ 'prefix' => 'users' ], function(){
            Route::get('/get', [UsersController::class, 'GetUser']);
            Route::get('/list', [UsersController::class, 'ListUser']);
            Route::post('/update', [UsersController::class, 'Update']);
            Route::post('/validate', [AuthController::class, 'ValidateUser']);
            Route::post('/set-relationship', [UsersController::class, 'SetRelationship']);
            Route::post('/get-relationship', [UsersController::class, 'GetRelationship']);
        });

        // ADMIN
        Route::group([ 'prefix' => 'admin' ], function(){
            Route::get('/content/get', [AdminController::class, 'GetContent']);
            Route::get('/content/list', [AdminController::class, 'ListContent']);
            Route::post('/content/register', [AdminController::class, 'RegisterContent']);
            Route::post('/content/remove', [AdminController::class, 'RemoveContent']);
            // Route::post('/content/reorder', [AdminController::class, 'ReorderContent']);
        });

        // OLD
        Route::group([ 'prefix' => 'content' ], function(){
            Route::get('/get-list-content', [ContentController::class, 'GetListContent']);
            Route::post('/register-content', [ContentController::class, 'RegisterContent']);
            Route::post('/get-content', [ContentController::class, 'GetContent']);
            // Route::post('/graph', [ContentController::class, 'Graph']);
            Route::post('/remove-content', [ContentController::class, 'RemoveContent']);
            Route::post('/reorder-content', [ContentController::class, 'ReorderContent']);
        });
        // ----

        Route::group([ 'prefix' => 'files' ], function(){
            Route::post('/list-medias', [FileController::class, 'ListMedias']);
            Route::post('/remove-medias', [FileController::class, 'RemoveMedias']);
            Route::post('/upload-media', [FileController::class, 'UploadMedia']);
            Route::post('/upload-base64', [FileController::class, 'UploadBase64']);
        });

        Route::group([ 'prefix' => 'group' ], function(){
            Route::post('/register', [GroupController::class, 'Register']);
            Route::get('/get/{id}', [GroupController::class, 'Get']);
            Route::put('/update/{id}', [GroupController::class, 'Update']);
            Route::get('/list', [GroupController::class, 'List']);
            Route::delete('/delete/{id}', [GroupController::class, 'Delete']);
            Route::get('/get-all-descendants/{id}', [GroupController::class, 'GetAllDescendants']);
        });
    });

    Route::post('/logout', [AuthController::class, 'Logout']);
});

// CRON
Route::group([ 'prefix' => 'cron' ], function(){
    Route::get('/normalize-file-data', [CronController::class, 'NormalizeFileData']);
    Route::get('/migrate', [CronController::class, 'MigrateData']);
    Route::get('/normalize-media-content', [CronController::class, 'NormalizeMediaContent']);
});

// HOOKS
Route::group([ 'prefix' => 'hooks' ], function(){
    Route::post('/stripe', [HooksController::class, 'Stripe']);
    Route::post('/pagarme', [HooksController::class, 'Pagarme']);
});

// CONTENT
Route::group([ 'prefix' => 'content' ], function(){
    Route::get('/products', [ContentController::class, 'Products']);
    Route::get('/product', [ContentController::class, 'Product']);
    Route::get('/default', [ContentController::class, 'Default']);
    Route::get('/home', [ContentController::class, 'Home']);
    Route::get('/about', [ContentController::class, 'About']);
    Route::get('/faq', [ContentController::class, 'Faq']);
    Route::get('/become-partner', [ContentController::class, 'BecomePartner']);
    Route::get('/dashboard', [ContentController::class, 'Dashboard']);
    Route::get('/partners', [ContentController::class, 'Partners']);
    Route::get('/blog', [ContentController::class, 'Blog']);
    Route::get('/post/{slug?}', [ContentController::class, 'Post']);
    Route::get('/contact', [ContentController::class, 'Contact']);
    Route::get('/communicate/{slug?}', [ContentController::class, 'Communicate']);
    Route::get('/order', [ContentController::class, 'Order']);
    Route::get('/register', [ContentController::class, 'Register']);
    Route::get('/roles', [ContentController::class, 'Roles']);
    Route::get('/account/user', [ContentController::class, 'AccountUser']);
    Route::get('/account/address', [ContentController::class, 'AccountAddress']);
});

// REST / GRAPH
Route::group([ 'prefix' => 'request' ], function(){
    Route::post('/graph', [RequestController::class, 'Graph']);

    Route::get('/products', [ProductsController::class, 'List']);
    Route::get('/product', [ProductsController::class, 'Get']);
    Route::get('/stores', [StoresController::class, 'List']);
    Route::get('/store', [StoresController::class, 'Get']);
    Route::get('/categories', [CategoriesController::class, 'List']);
    Route::get('/categories-paths', [CategoriesController::class, 'Paths']);
    Route::get('/category', [CategoriesController::class, 'Get']);

    Route::get('/blog', [ProductsController::class, 'List']);
});

