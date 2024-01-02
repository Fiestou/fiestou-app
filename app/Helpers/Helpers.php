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

	    $string 		= preg_replace($acento, explode(" ","a A e E i I o O u U n N C c"), $string);
	    $string 		= strtolower($string);

	    return $string;
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
