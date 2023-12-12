import Cors from "cors";

const cors = Cors({
  methods: ["GET", "HEAD", "POST"],
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

async function handler(req: any, res: any) {
  const url = !!req.query?.route ? `${req.query?.route}` : "/";

  const redirect = !!req.query?.redirect ? `${req.query?.redirect}` : "/";

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await runMiddleware(req, res, cors);
    await res.revalidate(url);

    const hash = new Date().toLocaleString();

    return res.redirect(307, `${redirect}?cache=true&hash=${btoa(hash)}`);
  } catch (err) {
    // console.log(err);
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({ err: err });
  }
}

export default handler;
