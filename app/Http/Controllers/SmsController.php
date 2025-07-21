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


        $to = trim(preg_replace("/[^0-9]/", "", $request->input('phone')));
        $to = (substr($to, 0, 2) !== "55") ? "+55".$to : "+".$to;

        $message = strip_tags(nl2br(str_replace("<br>", "\n", $request->input('content'))));

        try {

            $twilio_sid             = env('TWILIO_SID');
            $twilio_token           = env('TWILIO_AUTH_TOKEN');
            $twilio_phone_number    = env('TWILIO_PHONE_NUMBER');

            $twilio = new Client($twilio_sid, $twilio_token);

            $request = $twilio->messages->create(
                $to,
                [
                    "body" => "Fiestou: " . $message,
                    "from" => $twilio_phone_number
                ]
            );

            return response()->json([
                'response'  => true,
                'message'   => [
                        "to"    => $to,
                        "body"  => $message,
                        "from"  => $twilio_phone_number,
                        "log"   => $request->sid
                    ],
            ], 200);
        }
        catch (\Exception $e) {

            return response()->json([
                'response'  => false,
                'phone'     => $to,
                'message'   => $e->getMessage(),
            ], 500);
        }
    }
}
