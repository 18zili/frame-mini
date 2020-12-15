const Koa = require('./koa');
const KoaRouter = require('./koa-router');

const app = new Koa();
const router = new KoaRouter();

router.get('/index', (ctx) => (ctx.body = 'index page'));
router.get('/about', (ctx) => (ctx.body = 'about page'));

app.use(router.routes());

app.listen(8080);
