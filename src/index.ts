import Koa from 'koa';
import Router from 'koa-router';
import { exec } from 'child_process';

const app = new Koa();
const router = new Router();

router.get('/gallery-dl/get-urls', async (ctx: Koa.Context, next: () => Promise<any>) => {
  let url: string | string[] | undefined = ctx.request.query.url;
  if (Array.isArray(url)) {
    url = url[0]; // take the first URL if multiple are provided
  }
  if (!url || typeof url !== 'string') {
    ctx.status = 400;
    ctx.body = 'Invalid or missing url parameter';
    return;
  }

  const command = `gallery-dl --get-urls "${url}"`;

  const mediaUrls: string[] = await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(
          stdout
            .split('\n')
            .filter(Boolean)
            .map(url => url.startsWith('| ') ? url.substring(2) : url), // remove "| " from the start of each URL
        );
        // resolve(stdout.split('\n').filter(Boolean)); // filter out empty lines
      }
    });
  });

  ctx.body = {
    originalUrl: url,
    mediaUrls,
  };
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
