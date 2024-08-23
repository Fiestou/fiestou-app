<?php

if(!function_exists('slugify')){
    function slugify($string)
	{
		$string 		= strtolower(trim($string));
		$string 		= str_replace(' ', '_', $string);
		$string         = str_replace('+', '', $string);
		$acento 		= [
	    	"/(á|à|ã|â|ä)/",
	    	"/(Á|À|Ã|Â|Ä)/",
	    	"/(é|è|ê|ë)/",
	    	"/(É|È|Ê|Ë)/",
	    	"/(í|ì|î|ï)/",
	    	"/(Í|Ì|Î|Ï)/",
	    	"/(ó|ò|õ|ô|ö)/",
	    	"/(Ó|Ò|Õ|Ô|Ö)/",
	    	"/(ú|ù|û|ü)/",
	    	"/(Ú|Ù|Û|Ü)/",
	    	"/(ñ)/",
	    	"/(Ñ)/",
	    	"/(Ç)/",
	    	"/(ç)/"
	    ];

	    $string = preg_replace($acento, explode(" ","a A e E i I o O u U n N C c"), $string);
	    $string = strtolower($string);

	    return $string;
	}
}

if(!function_exists('moneyFormat')){
    function moneyFormat($amount) {
        return number_format($amount, 2, ',', '.');
    }
}

if(!function_exists('floatFormat')){
    function floatFormat($amount) {
        return floatval(str_replace(',', '.', $amount));
    }
}

if(!function_exists('handleSearchTerms')){
    function handleSearchTerms($texto) {
        $termosDeLigacao = [
            '-', 'a','o','as','os','um','uma','uns','umas','de','do','da',
            'dos','das','em','no','na','nos','nas','por','com','sem',
            'e','mas','ou','nem','porque','quando','que','se','então',
            'para','até','contra','perante','sob','sobre','trás'
        ];

        $texto = preg_replace('/[^\p{L}\s]/u', '', $texto);

        $palavras = array_filter(explode(' ', $texto));

        $palavrasFiltradas = array_filter($palavras, function($palavra) use ($termosDeLigacao) {
            return !in_array(strtolower($palavra), $termosDeLigacao);
        });

        return implode(' ', $palavrasFiltradas);
    }
}

if (!function_exists('cleanHTMLtoSMS')) {
    function cleanHTMLtoSMS($text) {

        $text = preg_replace('/\r\n|\r|\n/', ' - ', $text);

        $text = strip_tags($text);

        return $text;
    }
}

if(!function_exists('isJson')){
    function isJson($string) {
        if(is_string($string)){
            json_decode($string);
            return (json_last_error() == JSON_ERROR_NONE);
        }
        return false;
    }
}
