<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Image Driver
    |--------------------------------------------------------------------------
    |
    | Intervention Image supports "GD Library" and "Imagick" to process images
    | internally. You may choose one of them according to your PHP
    | configuration. By default PHP's "GD Library" implementation is used.
    |
    | Supported: "gd", "imagick"
    |
    */

    'driver' => 'gd',
    // 'driver' => 'imagick',
    'image_sizes' => [
        ['width' => 150, 'name' => 'thumb', 'default' => true],
        ['width' => 400, 'name' => 'sm', 'default' => false],
        ['width' => 800, 'name' => 'md', 'default' => false],
        ['width' => 1280,'name' => 'lg', 'default' => false],
        ['width' => 1920, 'name' => 'xl', 'default' => false]
    ],
];
