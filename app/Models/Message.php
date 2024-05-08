<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\HtmlString;
use SendGrid\Mail\Mail as SendGridMail;
use Illuminate\Support\Str;
use DB;

class Message extends BaseModel
{
    public static function RegisterUserMail(){
        return true;
    }

    public static function RegisterOrderMail(){
        return true;
    }

    public static function CompleteOrderMail(){
        return true;
    }

    public static function PartnerNewOrderMail(){
        return true;
    }

    public static function ChangeDeliveryStatusMail(){
        return true;
    }

    public static function send($to, $name, $subject, $content){

        $data = [
            'subject' => $subject,
            'content' => new HtmlString($content)
        ];

        $email = new SendGridMail();
        $email->setFrom("noreply@fiestou.com.br", "Mensagem Fiestou");
        $email->addTo($to, $name);
        $email->setSubject($subject);
        $email->addContent("text/plain", strip_tags($content));
        $email->addContent("text/html", view('email.handle_mail', compact('data'))->render());
        $sendgrid = new \SendGrid(env('SENDGRID_API_KEY'));

        try {
            $response = $sendgrid->send($email);

            return response()->json([
                'response'  => true,
                'message'   => "sended",
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'response'  => false,
                'message'   => "Erro ao enviar o e-mail: " . $response->body(),
                'errors'    => $e->getMessage()
            ], 500);
        }
    }
}
