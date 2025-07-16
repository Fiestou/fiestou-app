<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ElementsController;


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
        Route::get('/pre-register/{ref}', [AuthController::class, 'GetPreRegisterData']);
        Route::post('/recovery', [AuthController::class, 'Recovery']);
        Route::post('/redefine', [AuthController::class, 'Redefine']);
    });

    //STORESCONTROLLER
    Route::group([ 'prefix' => 'stores' ], function(){
        Route::post('/complete-register', [StoresController::class, 'CompleteRegister']);
    });

    Route::group(['middleware' => 'jwt.auth'],function(){

        Route::prefix('info')->as('split.')->group(function () {
            Route::Get('recipient/infos/{id}', [OrdersController::class, 'show']);
            Route::Get('recipient/withdraw/{id}', [WithdrawController::class, 'show']);
            Route::Get('recipient/config/{id}', [SplitPayment::class, 'show']);
            Route::Get('recipient/config/{id}', [SplitPayment::class, 'show']);
        });

        // Solicitações de saque 
        Route::post('/orders/list', [OrdersController::class, 'List']);
        Route::get('/orders/list/{id}', [OrdersController::class, 'getOrderById']);
        Route::post('/orders/get', [OrdersController::class, 'Get']);
        Route::post('/orders/register', [OrdersController::class, 'Register']);
        Route::post('/orders/register-meta', [OrdersController::class, 'RegisterMeta']);
        Route::post('/orders/processing', [OrdersController::class, 'Processing']);

        // SUBORDERS
        Route::post('/suborders/list', [SubordersController::class, 'List']);
        Route::post('/suborders/get', [SubordersController::class, 'Get']);
        Route::post('/suborders/register', [SubordersController::class, 'Register']);

        // CATEGORIES
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

        Route::group([ 'prefix' => 'group' ], function() {
            //Rota para listar todos os grupos com seus elementos
            Route::get('/list', [GroupController::class, 'List']);

            // Rota para registrar um novo grupo
            Route::post('/register', [GroupController::class, 'Register']);
        
            // Rota para atualizar um grupo existente
            Route::put('/update/{GroupId}', [GroupController::class, 'Update']);
        
            // Rota para deletar um grupo
            Route::delete('/delete/{GroupId}', [GroupController::class, 'Delete']);
        
            // Rota para obter todos os descendentes de um grupo
            Route::get('/descendants/{GroupId}', [GroupController::class, 'GetAllDescendants']);

            Route::get('/targetadc', [GroupController::class, 'ListTargetAdc']);
        
            // Rota para deletar um elemento de um grupo
            Route::delete('/{GroupId}/element/{ElementId}', [GroupController::class, 'DeleteGroupElement']);
        });
        
        Route::group([ 'prefix' => 'element' ], function() {
            // Rota para registrar um novo elemento dentro de um grupo
            Route::post('/register/{GroupId}', [ElementsController::class, 'Register']);

            // Rota para registrar um novo elemento dentro de um grupo
            Route::post('/ChildGroup/{GroupId}', [ElementsController::class, 'GetElement']);

            // Rota para atualizar um elemento específico dentro de um grupo
            Route::put('/update/{GroupId}/{ElementId}', [ElementsController::class, 'Update']);
            
            // Rota para listar todos os descendentes de um elemento específico
            Route::get('/descendants/{ElementId}', [ElementsController::class, 'Descendants']);
        });
    });

    Route::post('/logout', [AuthController::class, 'Logout']);
});

Route::group([ 'prefix' => 'group' ], function(){
    Route::get('/get/{GroupId}', [GroupController::class, 'Get']);
    Route::get('/list', [GroupController::class, 'List']);
    Route::get('/listgroupstore', [GroupController::class, 'listGroupsByStore']);
    Route::get('/{GroupId}/descendants', [GroupController::class, 'GetAllDescendants']);
    Route::get('/targetadcpbl', [GroupController::class, 'ListTargetAdcPublic']);
});

Route::group([ 'prefix' => 'element' ], function(){
    Route::get('/get/{ElementId}', [ElementsController::class, 'Get']);
    Route::get('/list', [ElementsController::class, 'List']);
    Route::get('/{ElementId}/descendants', [ElementsController::class, 'GetAllDescendants']);
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

    Route::get('/blog', [ProductsController::class, 'List']);
});

