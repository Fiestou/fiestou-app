import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let post = req.body;

  try {
    axios
      .post(process.env.BASE_URL + "/api/mail-send", post)
      .then(({ data }) => {
        if (data.response) {
          res.status(200).json({
            response: data.response,
          });
        } else {
          res.status(500).json({
            response: data.response,
          });
        }
      })
      .catch(({ response }) => {
        console.log(response, "<--");
        res.status(500).json({
          response: response,
        });
      });
  } catch (err) {
    console.log("500", err);
  }
}
