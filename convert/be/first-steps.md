### Першыя крокі

У гэтым наборы артыкулаў вы даведаецеся **асноўныя асновы** Nest. Каб азнаёміцца ​​з асноўнымі будаўнічымі блокамі прыкладанняў Nest, мы створым базавую праграму CRUD з функцыямі, якія ахопліваюць шмат пытанняў на пачатковым узроўні.

#### Мова

Мы любім [TypeScript](https://www.typescriptlang.org/) , але больш за ўсё мы любім [Node.js.](https://nodejs.org/en/) Вось чаму Nest сумяшчальны як з TypeScript, так і **з чыстым JavaScript** . Nest выкарыстоўвае найноўшыя моўныя магчымасці, таму, каб выкарыстоўваць яго з ванільным JavaScript, нам спатрэбіцца кампілятар [Babel](https://babeljs.io/) .

Мы ў асноўным будзем выкарыстоўваць TypeScript у прадстаўленых прыкладах, але вы заўсёды можаце **пераключыць фрагменты кода** на сінтаксіс JavaScript (проста націсніце, каб пераключыць кнопку мовы ў правым верхнім куце кожнага фрагмента).

#### Перадумовы

Пераканайцеся, што ў вашай аперацыйнай сістэме ўсталяваны [Node.js](https://nodejs.org) (версія &gt;= 16).

#### Усталяваць

З [Nest CLI](/cli/overview) наладзіць новы праект даволі проста. З усталяваным [npm](https://www.npmjs.com/) вы можаце стварыць новы праект Nest з дапамогай наступных каманд у тэрмінале АС:

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> info **Hint** To create a new project with TypeScript's [stricter](https://www.typescriptlang.org/tsconfig#strict) feature set, pass the `--strict` flag to the `nest new` command.

Будзе створаны каталог `project-name` , будуць устаноўлены модулі вузлоў і некалькі іншых шаблонных файлаў, а таксама будзе створаны каталог `src/` і запоўнены некалькімі асноўнымі файламі.

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.spec.ts</div>
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

Вось кароткі агляд гэтых асноўных файлаў:

|                          |                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| `app.controller.ts`      | Базавы кантролер з адным маршрутам.                                                                                 |
| `app.controller.spec.ts` | Модульныя тэсты для кантролера.                                                                                     |
| `app.module.ts`          | Каранёвы модуль прыкладання.                                                                                        |
| `app.service.ts`         | Базавая паслуга з дапамогай аднаго метаду.                                                                          |
| `main.ts`                | The entry file of the application which uses the core function `NestFactory` to create a Nest application instance. |

`main.ts` уключае асінхронную функцыю, якая будзе **запускаць** наша дадатак:

```typescript
@@filename(main)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

Каб стварыць асобнік прыкладання Nest, мы выкарыстоўваем асноўны клас `NestFactory` . `NestFactory` прапануе некалькі статычных метадаў, якія дазваляюць стварыць асобнік прыкладання. Метад `create()` вяртае аб'ект прыкладання, які выконвае інтэрфейс `INestApplication` . Гэты аб'ект забяспечвае набор метадаў, якія апісаны ў наступных раздзелах. У прыведзеным вышэй прыкладзе `main.ts` мы проста запускаем наш HTTP-слухач, які дазваляе прыкладанню чакаць ўваходных HTTP-запытаў.

Note that a project scaffolded with the Nest CLI creates an initial project structure that encourages developers to follow the convention of keeping each module in its own dedicated directory.

> info **Hint** By default, if any error happens while creating the application your app will exit with the code `1`. If you want to make it throw an error instead disable the option `abortOnError` (e.g., `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})`).

<app-banner-courses></app-banner-courses>

#### Платформа

Nest імкнецца быць фрэймворкам, які не залежыць ад платформы. Незалежнасць ад платформы дазваляе ствараць шматразовыя лагічныя часткі, якія распрацоўшчыкі могуць выкарыстоўваць у розных тыпах прыкладанняў. Тэхнічна Nest можа працаваць з любым фрэймворкам Node HTTP пасля стварэння адаптара. Існуюць дзве стандартныя платформы HTTP, якія падтрымліваюцца: [express](https://expressjs.com/) і [fastify](https://www.fastify.io) . Вы можаце выбраць той, які найбольш адпавядае вашым патрэбам.

|                    |                                                                                                                                                                                                                                                                                                                                    |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `platform-express` | [Express](https://expressjs.com/) is a well-known minimalist web framework for node. It's a battle tested, production-ready library with lots of resources implemented by the community. The `@nestjs/platform-express` package is used by default. Many users are well served with Express, and need take no action to enable it. |
| `platform-fastify` | [Fastify](https://www.fastify.io/) is a high performance and low overhead framework highly focused on providing maximum efficiency and speed. Read how to use it [here](/techniques/performance).                                                                                                                                  |

Whichever platform is used, it exposes its own application interface. These are seen respectively as `NestExpressApplication` and `NestFastifyApplication`.

When you pass a type to the `NestFactory.create()` method, as in the example below, the `app` object will have methods available exclusively for that specific platform. Note, however, you don't **need** to specify a type **unless** you actually want to access the underlying platform API.

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

#### Запуск прыкладання

Пасля завяршэння працэсу ўстаноўкі вы можаце выканаць наступную каманду ў камандным радку вашай АС, каб запусціць прыкладанне праслухоўванне ўваходных HTTP-запытаў:

```bash
$ npm run start
```

> info **Hint** To speed up the development process (x20 times faster builds), you can use the [SWC builder](/recipes/swc) by passing the `-b swc` flag to the `start` script, as follows `npm run start -- -b swc`.

Гэтая каманда запускае праграму з HTTP-серверам, які праслухоўвае порт, вызначаны ў файле `src/main.ts` . Пасля запуску прыкладання адкрыйце браўзер і перайдзіце да `http://localhost:3000/` . Вы павінны ўбачыць `Hello World!` паведамленне.

Каб сачыць за зменамі ў вашых файлах, вы можаце выканаць наступную каманду, каб запусціць прыкладанне:

```bash
$ npm run start:dev
```

Гэтая каманда будзе сачыць за вашымі файламі, аўтаматычна перакампілюючы і перазагружаючы сервер.

#### Linting and formatting

[CLI](/cli/overview) provides best effort to scaffold a reliable development workflow at scale. Thus, a generated Nest project comes with both a code **linter** and **formatter** preinstalled (respectively [eslint](https://eslint.org/) and [prettier](https://prettier.io/)).

> info **Hint** Not sure about the role of formatters vs linters? Learn the difference [here](https://prettier.io/docs/en/comparison.html).

Каб забяспечыць максімальную стабільнасць і пашыральнасць, мы выкарыстоўваем пакеты Base [`eslint`](https://www.npmjs.com/package/eslint) і [`prettier`](https://www.npmjs.com/package/prettier) cli. Такая ўстаноўка дазваляе акуратную інтэграцыю IDE з афіцыйнымі пашырэннямі.

Для асяроддзя без галавы, дзе IDE не мае значэння (бесперапынная інтэграцыя, перахваткі Git і г.д.), праект Nest пастаўляецца з гатовымі да выкарыстання сцэнарыямі `npm` .

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format
```
