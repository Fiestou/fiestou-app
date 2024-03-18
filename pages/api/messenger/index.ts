// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TemplateMail } from "./template";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let nodemailer = require("nodemailer");

  require("dotenv").config();

  const transporter = nodemailer.createTransport({
    pool: true,
    port: process.env.smtp_port,
    host: process.env.smtp_host,
    auth: {
      user: process.env.smtp_user,
      pass: process.env.smtp_pass,
    },
    secure: false,
  });

  const mailData = {
    from: `${req.body.subject} <${process.env.smtp_user}>`,
    to: req.body.email_to,
    subject: `${req.body.subject} | Fiestou`,
    text: req.body.message,
    html: TemplateMail({ title: req.body.subject, message: req.body.message }),
  };

  transporter.sendMail(mailData, function (err: any, info: any) {
    if (err) {
      // // console.log(err);
      res.status(500).json({ err: err });
    } else {
      // // console.log(info);
      res.status(200).json({ info: info, body: mailData });
    }
  });
}
