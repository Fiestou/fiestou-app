<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ValidateUser extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $address        = 'noreply@8pdev.studio';
        $subject        = 'Pedido efetuado!';
        $name           = '';
        $data           = $this->data;

        return $this->view('email.client_order', compact('data'))
            ->from($address, $name)
            ->subject($subject);
    }
}
