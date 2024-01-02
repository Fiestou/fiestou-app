<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\HtmlString;

class HandleMail extends Mailable implements ShouldQueue
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
<<<<<<< HEAD
        $address    = 'fiestou@8pdev.studio';
        $subject    = $this->data['subject'];
        $name       = 'Mensagem Fiestou';
=======
        $address    = 'noreply@8pdev.studio';
        $subject    = $this->data['subject'];
        $name       = 'Fiestou';
>>>>>>> refs/remotes/origin/master

        return $this->view('email.handle_mail')
                    ->with(['data' => $this->data])
                    ->from($address, $name)
                    ->subject($subject);
    }
}
