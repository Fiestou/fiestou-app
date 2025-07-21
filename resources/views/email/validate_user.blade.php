@extends('email.layout')

@section('title', 'Acesso concedido')

@section('msg')

    <p>
        Olá <b>{{ $data['user']->name }}</b>, seu acesso à nossa plataforma foi concedido.</p>
    <p>
        Acesse o link abaixo para fazer seu primeiro login:
    </p>
    <p>
        <a target='_blank' href="#">Login</a>
    </p>
    <p><i>*Este link irá expirar dentro de 24 horas.</i></p>

@endsection
