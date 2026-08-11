<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LinkController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::view('/{path?}', 'app')->where('path', '.*');
//
//Route::get('/', function () {
//    return "Saffi Info: Page Not Found";
//})->name('defaultNotFound');

//Route::get('preview-order-new', function (){
//    return view('emails.new-order', [
//        'name' => 'Đỗ Thanh Tùng Teng',
//        'order_id' => '26061676YWXH1R',
//        'amount' => '145040',
//    ]);
//});
//
//Route::get('preview-order-complete', function (){
//    return view('emails.more-commission.double-day', ['month' => 7]);
//});
//Route::get('/{sub_id}', [LinkController::class, 'accessFromShortLink']);

