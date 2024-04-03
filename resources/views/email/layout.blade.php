<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Fiestou</title>
    <style type="text/css">
        body {
            font-size: 18px;
            font-family: "Calibri", Helvetica, arial, sans-serif;
        }

        p {
            margin: 0;
            margin-bottom: 1rem;
        }

        @media screen and (max-width: 600px) {
            #header_wrapper {
                padding: 27px 36px !important;
                font-size: 24px;
            }

            #body_content_inner {
                font-size: 10px !important;
            }
        }
    </style>
</head>

<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"
    style="background-color: #f1f1f1; padding: 0; text-align: center;" bgcolor="#f1f1f1">
    <table width="100%" id="outer_wrapper" style="background-color: #f1f1f1;" bgcolor="#f1f1f1">
        <tbody>
            <tr>
                <td><!-- Deliberately empty to support consistent sizing and layout across multiple email clients. -->
                </td>
                <td width="600">
                    <div id="wrapper" dir="ltr"
                        style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px; -webkit-text-size-adjust: none;"
                        width="100%">
                        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                            <tbody>
                                <tr>
                                    <td align="center" valign="top">
                                        <div id="template_header_image">
                                        </div>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                            id="template_container"
                                            style="background-color: #fff;"
                                            bgcolor="#fff">
                                            <tbody>
                                                <tr>
                                                    <td align="center" valign="top">
                                                        <!-- Header -->
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            width="100%" id="template_header"
                                                            style="background-color: #00a7eb; color: #fff; border-bottom: 0; font-weight: bold; line-height: 100%; vertical-align: middle; font-family: 'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif; border-radius: 3px 3px 0 0;"
                                                            bgcolor="#00a7eb">
                                                            <tbody>
                                                                <tr>
                                                                    <td id="header_wrapper"
                                                                        style="padding: 36px 48px; display: block;text-align:center">
                                                                        <img src="https://api.fiestou.com.br/images/fiestou-logo-email.jpg"
                                                                            width="120">
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <!-- End Header -->
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" valign="top">
                                                        <!-- Body -->
                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                            width="100%" id="template_body">
                                                            <tbody>
                                                                <tr>
                                                                    <td valign="top" id="body_content"
                                                                        style="background-color: #fff;" bgcolor="#fff">
                                                                        <!-- Content -->
                                                                        <table border="0" cellpadding="20"
                                                                            cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td valign="top" style="padding: 0px">
                                                                                        <div id="body_content_inner"
                                                                                            style="text-align:center;color: #222222; font-family: 'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif; font-size: 14px; line-height: 150%;"
                                                                                            align="left">
                                                                                            @yield('msg')
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                        <!-- End Content -->
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <!-- End Body -->
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" valign="top">
                                        <!-- Footer -->
                                        <table border="0" cellpadding="10" cellspacing="0" width="100%"
                                            id="template_footer">
                                            <tbody>
                                                <tr>
                                                    <td valign="top" style="padding: 0;">
                                                        <table border="0" cellpadding="10" cellspacing="0"
                                                            width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td colspan="2" valign="middle" id="credit"
                                                                        style="border-radius: 6px; border: 0; color: #8a8a8a; font-family: 'Helvetica Neue',Helvetica,Roboto,Arial,sans-serif; font-size: 12px; line-height: 150%; text-align: center; padding: 24px 0;"
                                                                        align="center">
                                                                        <p style="margin:16px 0;">
                                                                            Fiestou
                                                                        </p>
                                                                        <p style="margin:16px 0;">
                                                                            Clicou 👆, Marcou 📅, Fiestou🍾
                                                                        </p>
                                                                        <p style="margin:16px 0;">
                                                                            <a target="_blank"
                                                                                style="display: inline-block;padding: 0 0.5rem ;"
                                                                                href="https://www.fiestou.com.br/"> www.fiestou.com.br
                                                                            </a>
                                                                        </p>
                                                                        <p style="margin:16px 0;">
                                                                            <a target="_blank"
                                                                                style="display: inline-block;padding: 0 0.5rem;"
                                                                                href="https://www.facebook.com/Fiestou.com.br">
                                                                                <img src="https://api.fiestou.com.br/images/icon-facebook.png" width="22"/> </a>
                                                                            <a target="_blank"
                                                                                style="display: inline-block;padding: 0 0.5rem;"
                                                                                href="https://br.pinterest.com/Fiestouapp/">
                                                                                <img src="https://api.fiestou.com.br/images/icon-pinterest.png" width="22"/> </a>
                                                                            <a target="_blank"
                                                                                style="display: inline-block;padding: 0 0.5rem;"
                                                                                href="https://www.instagram.com/fiestou/">
                                                                                <img src="https://api.fiestou.com.br/images/icon-youtube.png" width="22"/> </a>
                                                                            <a target="_blank"
                                                                                style="display: inline-block;padding: 0 0.5rem;"
                                                                                href="https://www.tiktok.com/@fiestou.app">
                                                                                <img src="https://api.fiestou.com.br/images/icon-tiktok.png" width="22"/> </a>
                                                                        </p>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <!-- End Footer -->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </td>
                <td><!-- Deliberately empty to support consistent sizing and layout across multiple email clients. -->
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
