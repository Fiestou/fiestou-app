<?php

namespace App\Http\Controllers;

use DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\Mail;
use App\Mail\HandleMail;
use SendGrid\Mail\Mail as SendGridMail;
use Illuminate\Support\Facades\View;
use App\Models\User;
use Illuminate\Support\Str;
use Twilio\Rest\Client;

class SmsController extends Controller
{
    public function SendSMS(Request $request){

        $request->validate([
            'phone' => 'required',
            'subject' => 'required',
            'content' => 'required',
        ]);

        $to         = trim(preg_replace("/[^0-9]/", "", $request->input('phone')));
        $message    = $request->input('content');

        $twilio_sid             = env('TWILIO_SID');
        $twilio_token           = env('TWILIO_AUTH_TOKEN');
        $twilio_phone_number    = env('TWILIO_PHONE_NUMBER');

        $twilio = new Client($twilio_sid, $twilio_token);

        $twilio->messages->create(
            // "+55".$to,
            "+5583999791586",
            [
                "body" => nl2br(strip_tags($message)),
                "from" => $twilio_phone_number
            ]
        );

        return response()->json([
            'response'  => true,
            'message'   => "sended",
        ], 200);
    }
}
