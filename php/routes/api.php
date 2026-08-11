<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\GoogleController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\LeaderBoardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\CommissionBacklistUserController;
use App\Http\Controllers\Api\AnalyticController;
use App\Http\Controllers\Api\SpointController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\Admin\EmailTemplateController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//auth with Google
Route::post('/auth/google', [GoogleController::class, 'handleGoogleLogin'])->middleware('guest');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('guest');
Route::get('/site-settings', [SystemController::class, 'getSiteSettings']);

Route::middleware([
    'api',
    'throttle:60,1',
    'auth:sanctum',
    'valid-limit-param'
])->group(function () {
    //auth
    Route::prefix('/auth')->group(function () {
        Route::get('/user', [AuthController::class, 'getAuthUser']);
        Route::post('/logout', [GoogleController::class, 'logout']);
    });

    // user
    Route::prefix('/user')->group(function () {
        Route::put('/update', [UserController::class, 'selfUpdateUser']);
        Route::post('/password', [UserController::class, 'updatePassword']);
        Route::get('/list', [UserController::class, 'getUserList'])->middleware('is-admin');
    });

    //link affiliate
    Route::prefix('/link')->group(function () {
        Route::post('/convert', [LinkController::class, 'convert']);
        Route::get('/product/list', [LinkController::class, 'getShopeeOfferProductList']);
    });

    // order
    Route::prefix('/order')->group(function () {
        Route::get('/', [OrderController::class, 'getOrders']);
        Route::post('/import', [OrderController::class, 'importOrders'])->middleware('is-admin');
        Route::post('/manual-sync', [OrderController::class, 'syncOrderFromTiktok'])->middleware('is-admin');;
    });

    // leaderboard
    Route::get('/stat/leaderboard', [LeaderBoardController::class, 'getLeaderBoard']);

    // wallet
    Route::prefix('/wallet')->group(function () {
        Route::get('/', [WalletController::class, 'getSelfUserWallet']);
        Route::get('/withdrawals', [WalletController::class, 'getUserWithdrawals']);
        Route::get('/transactions', [WalletController::class, 'getUserTransactions']);
        Route::put('/withdrawals/{wallet_trans_id}/status', [WalletController::class, 'updateTransactionStatus'])->middleware('is-admin');
        Route::post('/withdraw', [WalletController::class, 'createWalletWithdrawal']);
    });

    // S-Point & Daily Checkin
    Route::prefix('/spoint')->group(function () {
        Route::get('/status', [SpointController::class, 'status']);
        Route::post('/checkin', [SpointController::class, 'checkin']);
        Route::get('/leaderboard', [SpointController::class, 'leaderboard']);
        Route::get('/history', [SpointController::class, 'history']);
        Route::post('/exchange', [SpointController::class, 'exchange']);
        Route::get('/exchanges', [SpointController::class, 'exchanges']);
    });

    // Referral (Giới thiệu nhận thưởng)
    Route::prefix('/referral')->group(function () {
        Route::get('/summary', [ReferralController::class, 'getSummary']);
        Route::get('/list', [ReferralController::class, 'getReferrals']);
    });

    // bank
    Route::prefix('/bank-account')->group(function () {
        Route::get('/{user_id}', [BankAccountController::class, 'getBankByUser'])->middleware(['ownerOrAdmin']);
        Route::put('/{user_id}', [BankAccountController::class, 'updateBankAccount'])->middleware(['ownerOrAdmin']);
    });

    Route::middleware('is-admin')->prefix('/admin')->group(function () {
        Route::get('/link-history', [LinkController::class, 'getLinkHistory']);
        Route::get('/system-config', [SystemController::class, 'getSystemConfig']);
        Route::post('/system-config', [SystemController::class, 'updateSystemConfig']);
        Route::get('/system-config/commission', [SystemController::class, 'getCommissionConfig']);
        Route::put('/system-config/commission', [SystemController::class, 'updateCommissionConfig']);
        Route::get('/system-config/checkin-gift', [SystemController::class, 'getCheckinGiftConfig']);
        Route::put('/system-config/checkin-gift', [SystemController::class, 'updateCheckinGiftConfig']);
        Route::get('/spoint-transactions', [SpointController::class, 'adminHistory']);
        Route::put('/system-config/site-settings', [SystemController::class, 'updateSiteSettings']);
        Route::post('/system-config/site-settings/assets/{asset}', [SystemController::class, 'uploadSiteAsset']);
        Route::get('/system-config/shopee_cookie', [SystemController::class, 'getShopeeCookieConfig']);
        Route::put('/system-config/shopee_cookie', [SystemController::class, 'updateShopeeCookie']);
        Route::prefix('/history-transaction')->group(function () {
            Route::get('/', [TransactionController::class, 'getAllTransactionHistory']);
            Route::get('/{user_id}', [TransactionController::class, 'getUserTransactionHistory']);
            Route::get('/{user_id}/overview', [TransactionController::class, 'getUserOverviewTransactionHistory']);
        });
        Route::prefix('/blacklist-commission')->group(function () {
            Route::get('/', [CommissionBacklistUserController::class, 'index']);
            Route::post('/', [CommissionBacklistUserController::class, 'create']);
            Route::delete('/{id}', [CommissionBacklistUserController::class, 'delete']);
        });

        Route::get('/analytics', [AnalyticController::class, 'getAnalytics']);

        Route::post('/link/replace', [LinkController::class, 'replaceLink']);

        // email template config
        Route::prefix('/email-templates')->group(function () {
            Route::get('/', [EmailTemplateController::class, 'index']);
            Route::post('/seed', [EmailTemplateController::class, 'seed']);
            Route::get('/{key}', [EmailTemplateController::class, 'show']);
            Route::put('/{key}', [EmailTemplateController::class, 'update']);
            Route::post('/{key}/preview', [EmailTemplateController::class, 'preview']);
            Route::post('/{key}/send-test', [EmailTemplateController::class, 'sendTest']);
            Route::post('/{key}/reset', [EmailTemplateController::class, 'reset']);
        });
    });
});


Route::middleware(['throttle:60,1'])->group(function () { // for webhook/callback
    Route::post('/postback/sync/tiktok', [OrderController::class, 'syncOrderFromTiktok'])->middleware('riohub.signature');
    Route::get('/postback/sync/lazada', [OrderController::class, 'syncOrderFromLazada']);

    Route::get('/analytics/stat', [AnalyticController::class, 'getStatAnalytics']);

    //for bot convert
    Route::post('/link/replace', [LinkController::class, 'replaceLink'])->middleware('zalo_bot.signature');
});
