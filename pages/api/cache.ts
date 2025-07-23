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

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await runMiddleware(req, res, cors);
    const response = await res.revalidate(url);

    if (url.includes("produtos")) {
      await res.revalidate("/");
      await res.revalidate("/produtos");
      await res.revalidate("/produtos/pagina/1");
    }

    if (!!req.query?.redirect) {
      const hash = new Date().toLocaleString();

      return res.redirect(
        307,
        `${req.query?.redirect}?cache=true&hash=${btoa(hash)}`
      );
    }

    return res.status(200).json({ response: response });
  } catch (err) {
    return res.status(500).json({ err: err });
  }
}

export default handler;
