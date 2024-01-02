<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\HtmlString;
<<<<<<< HEAD
use Illuminate\Support\Facades\Mail;
use App\Mail\HandleMail;
use SendGrid\Mail\Mail as SendGridMail;
=======
// use Illuminate\Support\Facades\Mail;
use App\Mail\HandleMail;
use SendGrid\Mail\Mail;
>>>>>>> refs/remotes/origin/master
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
<<<<<<< HEAD
            'subject' => $request->get('subject'),
            'content' => new HtmlString($request->get('content'))
        ];

        try {

            $response = Mail::to($request->get('email'))
                ->send(new HandleMail($data));

            if (Mail::failures()) {

                return response()->json([
                    'response'  => false,
                    'message'   => "Erro ao enviar o e-mail: " . Mail::failures(),
                ], 422);

            } else {

                return response()->json([
                    'response'  => true,
                    'data'      => $request->all()
                ]);
            }
        } catch (\Exception $e) {

            return response()->json([
                'response'  => false,
                'message'   => "Erro ao enviar o e-mail: " . $response->body(),
                'errors'    => $e->getMessage()
            ], 500);
        }
=======
            'subject' => $request->subject,
            'content' => new HtmlString($request->content)
        ];

        Mail::to($request->email)
            ->send(new HandleMail($data));

        return response()->json([
            'response' => true
        ]);
>>>>>>> refs/remotes/origin/master
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

<<<<<<< HEAD
        $email = new SendGridMail();
=======
        $email = new Mail();
>>>>>>> refs/remotes/origin/master
        $email->setFrom("noreply@fiestou.com.br", "Mensagem Fiestou");
        $email->addTo($request->get('email'), $request->get('name') ?? "");
        $email->setSubject($request->get('subject'));
        $email->addContent("text/plain", strip_tags($request->get('content')));
        $email->addContent("text/html", view('email.handle_mail', compact('data'))->render());
<<<<<<< HEAD
=======

>>>>>>> refs/remotes/origin/master
        $sendgrid = new \SendGrid(env('SENDGRID_API_KEY'));

        try {
            $response = $sendgrid->send($email);
<<<<<<< HEAD

            return response()->json([
                'response'  => true,
                'message'   => "sended",
            ], 200);

=======
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
>>>>>>> refs/remotes/origin/master
        } catch (\Exception $e) {
            return response()->json([
                'response'  => false,
                'message'   => "Erro ao enviar o e-mail: " . $response->body(),
                'errors'    => $e->getMessage()
            ], 500);
        }
<<<<<<< HEAD
=======


>>>>>>> refs/remotes/origin/master
    }
}
