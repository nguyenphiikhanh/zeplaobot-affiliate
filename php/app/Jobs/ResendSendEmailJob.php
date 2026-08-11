<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\User;
use App\Services\ResendService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ResendSendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    private const TYPE_PENDING = 'Pending';
    private const TYPE_COMPLETED = 'Completed';
    private User $user;
    private Order $order;
    private string $type;
    public function __construct(User $user, Order $order, $type)
    {
        //
        $this->user = $user;
        $this->order = $order;
        $this->type = $type;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
        $resendService = new ResendService();
        sleep(2);
        if($this->type == self::TYPE_COMPLETED){
            $resendService->orderCompletePostResendEmail($this->user, $this->order);
        }
        else $resendService->orderNewPostResendEmail($this->user, $this->order);
    }
}
