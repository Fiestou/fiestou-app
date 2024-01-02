<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\HtmlString;
// use Illuminate\Support\Facades\Mail;
use App\Mail\HandleMail;
use SendGrid\Mail\Mail;
use Illuminate\Support\Facades\View;
use App\Models\User;
use Illuminate\Support\Str;

class MailController extends Controller
{
    public function MailSend_(Request $request){

        $request->validate([
            'email' => 'required',
            'subject' => 'required',
            'content' => 'required'
        ]);

        $data = [
            'subject' => $request->subject,
            'content' => new HtmlString($request->content)
        ];

        Mail::to($request->email)
            ->send(new HandleMail($data));

        return response()->json([
            'response' => true
        ]);
    }

    public function MailSend(Request $request){

        $request->validate([
            'email' => 'required',
            'subject' => 'required',
            'content' => 'required'
        ]);

        $data = [
            'subject' => $request->get('subject'),
            'content' => new HtmlString($request->get('content'))
        ];

        $email = new Mail();
        $email->setFrom("noreply@fiestou.com.br", "Mensagem Fiestou");
        $email->addTo($request->get('email'), $request->get('name') ?? "");
        $email->setSubject($request->get('subject'));
        $email->addContent("text/plain", strip_tags($request->get('content')));
        $email->addContent("text/html", view('email.handle_mail', compact('data'))->render());

        $sendgrid = new \SendGrid(env('SENDGRID_API_KEY'));

        try {
            $response = $sendgrid->send($email);
            if ($response->statusCode() == 202) {
                return response()->json([
                    'response'  => true,
                    'data'      => $request->all()
                ]);
            } else {
                return response()->json([
                    'response'  => false,
                    'message'   => "Erro ao enviar o e-mail: " . $response->body(),
                ], 422);
                return ;
            }
        } catch (\Exception $e) {
            return response()->json([
                'response'  => false,
                'message'   => "Erro ao enviar o e-mail: " . $response->body(),
                'errors'    => $e->getMessage()
            ], 500);
        }


    }
}
