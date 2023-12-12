@extends('email.layout')

@section('title', 'Cadastro realizado!')

@section('msg')
    <p>
        Olá <b>{{ $data['user']->name }}</b>, seu cadastro foi realizado com sucesso!
    </p>
    <p>
        Acesse o link abaixo para validar seu e-mail e realizar seu primeiro login.
    </p>
    <p><a href="{{ env('API_URL') . '/api/user-active?token=' . $data['user']->hash }}">Validar email</a></p>
@endsection
