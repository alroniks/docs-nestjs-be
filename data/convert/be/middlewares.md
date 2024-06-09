# Прамежкавае праграмнае забеспячэнне

Прамежкавае праграмнае забеспячэнне - гэта функцыя, якая выклікаецца **перад** апрацоўшчыкам маршруту. Функцыі прамежкавага праграмнага забеспячэння маюць доступ да аб'ектаў [запыту](https://expressjs.com/en/4x/api.html#req) і [адказу](https://expressjs.com/en/4x/api.html#res) , а таксама функцыі прамежкавага праграмнага забеспячэння `next()` у цыкле запыт-адказ прыкладання. **Наступная** функцыя прамежкавага праграмнага забеспячэння звычайна пазначаецца зменнай з імем `next` .

<figure><img src="/assets/Middlewares_1.png"/></figure>

Прамежкавае праграмнае забеспячэнне Nest па змаўчанні эквівалентна [экспрэс](https://expressjs.com/en/guide/using-middleware.html) - прамежкавым ПЗ. Наступнае апісанне з афіцыйнай экспрэс-дакументацыі апісвае магчымасці прамежкавага праграмнага забеспячэння:

<blockquote class="external">
  Функцыі прамежкавага праграмнага забеспячэння могуць выконваць наступныя задачы:
<ul>
<li> выканаць любы код.</li>
<li> уносіць змены ў аб'екты запыту і адказу.</li>
<li> завяршыць цыкл запыт-адказ.</li>
<li> выклікаць наступную функцыю прамежкавага праграмнага забеспячэння ў стэку.</li>
<li> калі бягучая функцыя прамежкавага праграмнага забеспячэння не завяршае цыкл запыт-адказ, яна павінна выклікаць <code>next()</code> каб перадаць кіраванне наступнай функцыі прамежкавага праграмнага забеспячэння. У адваротным выпадку запыт застанецца вісіць.</li>
</ul></blockquote>

Вы рэалізуеце карыстальніцкае прамежкавае праграмнае забеспячэнне Nest альбо ў функцыі, альбо ў класе з дэкаратарам `@Injectable()` . Клас павінен рэалізаваць інтэрфейс `NestMiddleware` , пры гэтым функцыя не мае асаблівых патрабаванняў. Давайце пачнем з рэалізацыі простай функцыі прамежкавага праграмнага забеспячэння з выкарыстаннем метаду класа.

> папярэджанне **Папярэджанне** `Express` і `fastify` па-рознаму апрацоўваюць прамежкавае праграмнае забеспячэнне і забяспечваюць розныя сігнатуры метадаў, чытайце больш [тут](/techniques/performance#middleware) .

```typescript
@@filename(logger.middleware)
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware {
  use(req, res, next) {
    console.log('Request...');
    next();
  }
}
```

## Ін'екцыя залежнасці

Прамежкавае праграмнае забеспячэнне Nest цалкам падтрымлівае Dependency Injection. Гэтак жа, як у выпадку з пастаўшчыкамі і кантролерам, яны могуць **уводзіць залежнасці** , якія даступныя ў адным модулі. Як звычайна, гэта робіцца праз `constructor` .

## Прымяненне прамежкавага праграмнага забеспячэння

У дэкаратары `@Module()` няма месца для прамежкавага праграмнага забеспячэння. Замест гэтага мы наладжваем іх з дапамогай метаду `configure()` класа модуля. Модулі, якія ўключаюць прамежкавае праграмнае забеспячэнне, павінны рэалізаваць інтэрфейс `NestModule` . Давайце наладзім `LoggerMiddleware` на ўзроўні `AppModule` .

```typescript
@@filename(app.module)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
@@switch
import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

У прыведзеным вышэй прыкладзе мы наладзілі `LoggerMiddleware` для апрацоўшчыкаў маршрутаў `/cats` , якія раней былі вызначаны ўнутры `CatsController` . Мы таксама можам дадаткова абмежаваць прамежкавае праграмнае забеспячэнне пэўным метадам запыту, перадаўшы аб'ект, які змяшчае `path` маршруту і `method` запыту, у метад `forRoutes()` пры наладжванні прамежкавага праграмнага забеспячэння. Звярніце ўвагу на тое, што ў прыведзеным ніжэй прыкладзе мы імпартуем пералік `RequestMethod` для спасылкі на патрэбны тып метаду запыту.

```typescript
@@filename(app.module)
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
@@switch
import { Module, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

:::info **Падказка** Метад `configure()` можна зрабіць асінхронным з дапамогай `async/await` (напрыклад, вы можаце `await` завяршэння асінхроннай аперацыі ўнутры цела метаду `configure()` ). :::

:::папярэджанне **Папярэджанне** Пры выкарыстанні `express` адаптара праграма NestJS па змаўчанні зарэгіструе `json` і `urlencoded` з `body-parser` пакета. Гэта азначае, што калі вы хочаце наладзіць прамежкавае праграмнае забеспячэнне праз `MiddlewareConsumer` , вам трэба адключыць глабальнае прамежкавае праграмнае забеспячэнне, усталяваўшы для флага `bodyParser` значэнне `false` пры стварэнні прыкладання з дапамогай `NestFactory.create()` . :::

## Падстаноўныя знакі маршруту

Таксама падтрымліваюцца маршруты на аснове шаблонаў. Напрыклад, зорачка выкарыстоўваецца як **сімвал падстаноўкі** і будзе адпавядаць любой камбінацыі знакаў:

```typescript
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

Шлях маршруту `'ab*cd'` будзе адпавядаць `abcd` , `ab_cd` , `abecd` і гэтак далей. Персанажы `?` , `+` , `*` і `()` могуць выкарыстоўвацца ў шляху маршруту і з'яўляюцца падмноствамі сваіх аналагаў рэгулярных выразаў. Злучок ( `-` ) і кропка ( `.` ) інтэрпрэтуюцца літаральна шляхамі на аснове радкоў.

:::папярэджанне **Папярэджанне** Пакет `fastify` выкарыстоўвае апошнюю версію пакета `path-to-regexp` , які больш не падтрымлівае падстаноўныя зорачкі `*` . Замест гэтага вы павінны выкарыстоўваць параметры (напрыклад, `(.*)` , `:splat*` ). :::

## Спажывец прамежкавага ПЗ

`MiddlewareConsumer` - гэта дапаможны клас. Ён забяспечвае некалькі ўбудаваных метадаў кіравання прамежкавым праграмным забеспячэннем. Усе яны могуць быць проста звязаны ў **ланцужок** у [беглым стылі](https://en.wikipedia.org/wiki/Fluent_interface) . Метад `forRoutes()` можа прымаць адзін радок, некалькі радкоў, аб'ект `RouteInfo` , клас кантролера і нават некалькі класаў кантролера. У большасці выпадкаў вы, верагодна, проста перадасце спіс **кантролераў,** падзеленых коскамі. Ніжэй прыведзены прыклад з адным кантролерам:

```typescript
@@filename(app.module)
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
@@switch
import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

:::info **Падказка** Метад `apply()` можа прымаць адно прамежкавае праграмнае забеспячэнне або некалькі аргументаў для ўказання <a href="/middleware#multiple-middleware">некалькіх прамежкавых праграм</a> . :::

## Без уліку маршрутаў

Часам мы хочам **выключыць** некаторыя маршруты з прымянення прамежкавага праграмнага забеспячэння. Мы можам лёгка выключыць пэўныя маршруты з дапамогай метаду `exclude()` . Гэты метад можа выключаць адзін радок, некалькі радкоў або аб'ект `RouteInfo` , які вызначае маршруты, як паказана ніжэй:

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/(.*)',
  )
  .forRoutes(CatsController);
```

:::info **Падказка** Метад `exclude()` падтрымлівае параметры падстаноўкі з выкарыстаннем пакета [шлях да рэгулярных выразаў](https://github.com/pillarjs/path-to-regexp#parameters) . :::

У прыведзеным вышэй прыкладзе `LoggerMiddleware` будзе прывязаны да ўсіх маршрутаў, вызначаных у `CatsController` **акрамя** трох, перададзеных у метад `exclude()` .

## Функцыянальнае прамежкавае праграмнае забеспячэнне

Клас `LoggerMiddleware` які мы выкарыстоўваем, даволі просты. Ён не мае членаў, дадатковых метадаў і залежнасцей. Чаму мы не можам проста вызначыць яго ў простай функцыі замест класа? На самай справе, мы можам. Гэты тып прамежкавага праграмнага забеспячэння называецца **функцыянальным прамежкавым праграмным забеспячэннем** . Давайце пераўтворым прамежкавае праграмнае забеспячэнне рэгістратара з класавага ў функцыянальнае прамежкавае праграмнае забеспячэнне, каб праілюстраваць розніцу:

```typescript
@@filename(logger.middleware)
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};
@@switch
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

І выкарыстоўвайце яго ў `AppModule` :

```typescript
@@filename(app.module)
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

:::info **Падказка** Разгледзьце магчымасць выкарыстання больш простай **функцыянальнай альтэрнатывы прамежкавага праграмнага забеспячэння** кожны раз, калі вашаму прамежкаваму праграмнаму забеспячэнню не патрэбныя ніякія залежнасці. :::

## Некалькі прамежкавага праграмнага забеспячэння

Як згадвалася вышэй, каб прывязаць некалькі прамежкавага праграмнага забеспячэння, якое выконваецца паслядоўна, проста ўвядзіце спіс праз коскі ўнутры метаду `apply()` :

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

## Глабальнае прамежкавае праграмнае забеспячэнне

Калі мы хочам прывязаць прамежкавае праграмнае забеспячэнне да кожнага зарэгістраванага маршруту адначасова, мы можам выкарыстоўваць метад `use()` , які пастаўляецца асобнікам `INestApplication` :

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

:::info **Падказка** Доступ да кантэйнера DI у глабальным прамежкавым ПЗ немагчымы. Замест гэтага вы можаце выкарыстоўваць [функцыянальнае прамежкавае праграмнае забеспячэнне](middleware#functional-middleware) пры выкарыстанні `app.use()` . Акрамя таго, вы можаце выкарыстоўваць прамежкавае праграмнае забеспячэнне класа і выкарыстоўваць яго з дапамогай `.forRoutes('*')` у `AppModule` (ці любым іншым модулі). :::
