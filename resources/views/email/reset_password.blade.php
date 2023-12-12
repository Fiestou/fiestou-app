@extends('email.layout')

@section('title', 'Redefinir senha')

@section('msg')

    <p>
        Olá <b>{{ $data['actor']->name }}</b>, recebemos seu pedido para mudança de senha.</p>
    <p>
        Acesse o link abaixo para redefinir:
    </p>
    <p>
        <a target='_blank'
            href="{{ env('VUE_APP_BOARD_URL') . '/recovery?token=' . $data['token'] }}">{{ env('VUE_APP_BOARD_URL') . '/recovery?token=' . $data['token'] }}</a>
    </p>
    <p><i>*Este link irá expirar dentro de 24 horas.</i></p>

@endsection
