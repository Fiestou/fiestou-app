<?php

namespace App\Models;

use Illuminate\Support\Arr;
use App\Models\BaseModel;
use Illuminate\Support\HtmlString;
use SendGrid\Mail\Mail as SendGridMail;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Media;
use Twilio\Rest\Client;
use DB;

class Message extends BaseModel
{


    public static function GetContentMessage($type){

        $handle = Content::where(["slug" => "email", "type" => "page"])
                          ->first()->setCustomContent();

        $content = [];
        $content["subject"]  = $handle->{$type."_subject"};
        $content["image"]    = $handle->{$type."_image"};
        $content["html"]     = $handle->{$type."_body"};

        $content["image"] = (isset($content['image']['medias'])) && isset($content['image']['medias'][0]) ? Media::GetImage($content['image']['medias'][0]) : "";

        $image = !empty($content["image"])
        ? '<img src="' . $content["image"] . '" style="width:100%;height:auto;" />'
        : '';

        $content["image"] = $image;

        return $content;
    }

    public static function RecoveryUser($user, $token){
        $content = '<div style="padding: 48px 48px 32px;"><p>Acesse o link abaixo para recuperar seu acesso: </p><p><a href="'.env('CLIENT_URL').'/recuperar/senha?token='.$token.'&email='.$user->email.'" style="border-radius: 6px;text-decoration: none;display: inline-block;font-weight:600;color:black;background-color:#ffda4a;padding: .85rem 1.25rem;">Redefinir senha</a></p></div>';

        // return Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', "Recuperação de Senha", $content);
        return Message::sendMail($user->email, $user->name, "Recuperação de Senha", $content);
    }

    public static function RegisterUser($user){

        $userDetails = !!$user->details ? json_decode($user->details, TRUE) : [];

        $content = Message::GetContentMessage("register");

        $validationLink = env('APP_URL') . "/api/user-active?token={$user->hash}";

        $html = $content['html'] . "<p><a href='{$validationLink}' style='border-radius: 6px;text-decoration: none;display: inline-block;font-weight:600;color:black;background-color:#ffda4a;padding: .85rem 1.25rem;'>Validar email</a></p>";
        $html = str_replace('{user_name}', $user->name, $html);
        $html = $content['image'] . "<div style='padding: 24px 48px 32px;'>".$html."</div>";

        // Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', $content['subject'], $html);
        Message::sendMail($user->email, $user->name, $content['subject'], $html);

        if(isset($userDetails['phone'])){
            Message::sendSMS($userDetails['phone'], cleanHTMLtoSMS($html));
        }
    }

    public static function RegisterOrder($order){

        $order->metadata        = !!$order->metadata ? json_decode($order->metadata, TRUE) : [];
        $order->listItems       = json_decode($order->listItems);
        $order->deliveryAddress = json_decode($order->deliveryAddress);

        $content = Message::GetContentMessage("order");

        // Obter o endereço de entrega
        $address = $order->deliveryAddress;
        $addressString = "Local: {$address->street}, {$address->number}, {$address->neighborhood} <br/> {$address->zipCode} <br/> {$address->city}, {$address->state} - {$address->country}" .
            (!empty($address->complement) ? "<br/>Complemento: " . $address->complement : "");

        // Criar a tabela de produtos
        $table = "<table style='width: 100%;border-collapse: collapse;'>";
        foreach ($order->listItems as $key => $item) {
            $rowStyle = $key % 2 != 0 ? "style='background-color: #f7f7f7;'" : "";
            $table .= "<tr {$rowStyle}>
                        <td align='left' style='padding: 4px'>{$item->quantity} x <b>{$item->product->title}</b></td>
                        <td align='right' style='padding: 4px'></td>
                        <td align='right' style='padding: 4px'> R$ " . moneyFormat($item->total) . "</td>
                    </tr>";
        }
        $table .= "<tr><td></td><td align='right'><b>Total:</b></td><td align='right'><b>R$ " . moneyFormat($order->total) . "</b></td></tr>";
        $table .= "</table>";

        // Adicionar informações de entrega
        $table .= "<br/><p style='font-weight: normal;text-align:left;'><b>ENTREGA - ".(!!$order->deliveryPrice ? $order->deliveryPrice : "Grátis")." </b><br/> " . Order::DeliveryToName($order->deliveryTo) . ", {$order->deliverySchedule} <br/>{$addressString}</p>";

        $user       = User::where(["id" => $order->user])->first();
        $userName   = $user->name ?? '';
        $userEmail  = $user->email ?? '';

        $html = str_replace('{user_name}', $userName, $content['html']);
        $html = str_replace('{items_order}', $table, $html);
        $html = str_replace('{order_code}', '#' . $order->id, $html);

        $html .= "<br/><p style='text-align: center;'>Acompanhe o status do pedido</p><p style='text-align: center;'><a href='" . env('CLIENT_URL') . "/dashboard/pedidos/{$order->id}' style='text-decoration: none;display: inline-block;font-weight:600;color:black;background-color:#ffda4a;border-radius: 6px;padding: .85rem 1.25rem;'>Acompanhar </a></p>";

        $html = $content['image'] . '<div style="padding: 24px 48px 32px;">' . $html . '</div>';

        // return Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', $content['subject'], $html);
        return Message::sendMail($userEmail, $userName, $content['subject'], $html);
    }

    public static function CompleteOrder($order){

        $content = Message::GetContentMessage("order_complete");

        $user       = User::where(["id" => $order->user])->first();
        $userName   = $user->name ?? '';
        $userEmail  = $user->email ?? '';
        $userDetails    = !!$user->details ? json_decode($user->details, TRUE) : [];

        $html = str_replace('{user_name}', $userName, $content['html']);
        $html = str_replace('{order_code}', '#' . $order->id, $html);
        $html = $content['image'] . '<div style="padding: 24px 48px 32px;">' . $html . '</div>';

        // Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', $content['subject'], $html);
        Message::sendMail($userEmail, $userName, $content['subject'], $html);

        if(isset($userDetails['phone'])){
            Message::sendSMS($userDetails['phone'], cleanHTMLtoSMS($html));
        }
    }

    public static function PartnerNewOrder($order){

        $order->listItems = json_decode($order->listItems);

        $products = [];

        foreach ($order->listItems as $key => $item) {
            array_push($products, $item->product->id);
        }

        $products = Product::with(['store'])
                                  ->where(['status' => 1])
                                  ->whereIn('id', $products)
                                  ->get();

        $notificate = [];

        foreach ($products as $key => $item) {
            if(!isset($notificate[$item->store])){
                $store = Store::select(["user"])
                              ->where(["id" => $item->store])
                              ->first();

                $user = User::select(["name", "email", "details"])
                            ->where([ 'id' => $store->user ])
                            ->first();

                if(isset($user->email)){
                    $details = json_decode($user->details, TRUE);
                    if(isset($details['phone'])){
                        $user->phone = $details['phone'];
                    }
                    unset($user->details);
                }

                $notificate[$item->store] = $user;
            }
        }

        $order->notificate = array_values($notificate);

        $content = Message::GetContentMessage("partner_order");

        foreach ($order->notificate as $store) {
            $html = str_replace('{partner_name}', $store->name, $content['html']);
            $html = str_replace('{order_code}', '#' . $order->id, $html);

            $html = $content['image'] . '<div style="padding: 24px 48px 32px;">' . $html . '</div>';

            if(isset($store->phone)){
                Message::sendSMS($store->phone, cleanHTMLtoSMS($html));
            }

            // Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', $content['subject'], $html);
            Message::sendMail($store->email, $store->name, $content['subject'], $html);
        }
    }

    public static function ChangeDeliveryStatus($order){
        $content = Message::GetContentMessage("delivery");

        $user       = User::where(["id" => $order->user])->first();
        $userName   = $user->name ?? '';
        $userEmail  = $user->email ?? '';
        $userDetails    = !!$user->details ? json_decode($user->details, TRUE) : [];

        $statusName = Order::DeliveryTypes($order->deliveryStatus);

        $html = str_replace('{user_name}', $userName, $content['html']);
        $html = str_replace('{status_delivery}', $statusName, $html);
        $html = str_replace('{order_code}', '#' . $order->id, $html);
        $html = $content['image'] . '<div style="padding: 24px 48px 32px;">' . $html . '</div>';

        // Message::sendMail('rafaelcarvalhosjrp@gmail.com', '', $content['subject'], $html);
        Message::sendMail($userEmail, $userName, $content['subject'], $html);

        if(in_array($order->deliveryStatus, ["pending", "collect", "sent"]) && isset($userDetails['phone'])){
            Message::sendSMS($userDetails['phone'], cleanHTMLtoSMS($html));
        }
    }

    public static function sendMail($to, $name, $subject, $content){

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
                'message'   => $response,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'response'  => false,
                'message'   => "Erro ao enviar o e-mail",
                'errors'    => $e->getMessage()
            ], 500);
        }
    }

    public static function sendSMS($phone, $content){

        $to = trim(preg_replace("/[^0-9]/", "", $phone));
        $to = (substr($to, 0, 2) !== "55") ? "+55".$to : "+".$to;

        $message = strip_tags(nl2br(str_replace("<br>", "\n", $content)));

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
