export const TemplateMail = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>fiestou</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style type="text/css">
        body {
          font-family: "Open Sans", "Helvetica Neue", Helvetica, arial, sans-serif;
        }
      </style>
    </head>
    <body style="background-color: #f1f1f1">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
        <tr>
          <td>
            <center>
              <img src="" width="200" style="margin: 30px 0;">
            </center>
          </td>
        </tr>
        <tr>
          <td style="background-color: #fff">
            <center style="padding: 30px;">
              <h2 style="text-transform: uppercase;">
                <b>${title}</b>
              </h2>
              ${message}
            </center>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px;">
            <center> 
              <a target="_blank" href="https://www.fiestou.com.br">fiestou.com.br</a> | 
              <a target="_blank" href="https://www.facebook.com/fiestou/">f/fiestou</a> | 
              <a target="_blank" href="https://www.instagram.com/fiestou">@fiestou</a>
            </center>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
