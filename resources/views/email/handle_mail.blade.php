@extends('email.layout')

@section('title', $data['subject'])

@section('msg')
    {{ $data['content'] }}
@endsection
