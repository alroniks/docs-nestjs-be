# Фільтры выключэнняў

Nest пастаўляецца з убудаваным **узроўнем выключэнняў** , які адказвае за апрацоўку ўсіх неапрацаваных выключэнняў у дадатку. Калі выключэнне не апрацоўваецца кодам вашага прыкладання, яно ўлоўліваецца гэтым узроўнем, які затым аўтаматычна адпраўляе адпаведны зручны адказ.

<figure><img src="/assets/Filter_1.png"/></figure>

Нестандартна гэта дзеянне выконваецца з дапамогай убудаванага **глабальнага фільтра выключэнняў** , які апрацоўвае выключэнні тыпу `HttpException` (і яго падкласы). Калі выключэнне **не распазнана** (не з'яўляецца ні `HttpException` , ні класам, які ўспадкоўвае ад `HttpException` ), убудаваны фільтр выключэнняў стварае наступны адказ JSON па змаўчанні:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

:::info **Падказка** Глабальны фільтр выключэнняў часткова падтрымлівае бібліятэку `http-errors` . Па сутнасці, любое выключанае выключэнне, якое змяшчае ўласцівасці `statusCode` і `message` будзе належным чынам запаўняцца і адпраўляцца назад у якасці адказу (замест стандартнага `InternalServerErrorException` для нераспазнаных выключэнняў). :::

## Выкід стандартных выключэнняў

Nest забяспечвае ўбудаваны клас `HttpException` , адкрыты з пакета `@nestjs/common` . Для тыповых прыкладанняў, заснаваных на HTTP REST/GraphQL API, пры ўзнікненні пэўных памылак лепш за ўсё адпраўляць стандартныя аб'екты адказу HTTP.

Напрыклад, у `CatsController` у нас ёсць метад `findAll()` (апрацоўшчык маршруту `GET` ). Давайце выкажам здагадку, што гэты апрацоўшчык маршруту па нейкай прычыне стварае выключэнне. Каб прадэманстраваць гэта, мы жорстка закадзіруем гэта наступным чынам:

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

:::info **Падказка** Мы выкарыстоўвалі тут `HttpStatus` . Гэта дапаможны пералік, імпартаваны з пакета `@nestjs/common` . :::

Калі кліент выклікае гэтую канчатковую кропку, адказ выглядае так:

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

Канструктар `HttpException` прымае два неабходныя аргументы, якія вызначаюць адказ:

- Аргумент `response` вызначае цела адказу JSON. Гэта можа быць `string` або `object` , як апісана ніжэй.
- Аргумент `status` вызначае [код стану HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) .

Па змаўчанні цела адказу JSON змяшчае дзве ўласцівасці:

- `statusCode` : па змаўчанні выкарыстоўваецца код стану HTTP, указаны ў аргументе `status`
- `message` : кароткае апісанне памылкі HTTP на аснове `status`

Каб перавызначыць толькі частку паведамлення ў целе адказу JSON, увядзіце радок у аргумент `response` . Каб перавызначыць увесь тэкст адказу JSON, перадайце аб'ект у аргумент `response` . Nest серыялізуе аб'ект і верне яго як цела адказу JSON.

Другі аргумент канструктара - `status` - павінен быць сапраўдным кодам стану HTTP. Найлепшая практыка - выкарыстоўваць пералік `HttpStatus` , імпартаваны з `@nestjs/common` .

Ёсць **трэці** аргумент канструктара (неабавязковы) - `options` - які можна выкарыстоўваць для вызначэння [прычыны](https://nodejs.org/en/blog/release/v16.9.0/#error-cause) памылкі. Гэты аб'ект `cause` не серыялізаваны ў аб'ект адказу, але ён можа быць карысны для мэт вядзення часопіса, даючы каштоўную інфармацыю аб унутранай памылцы, якая выклікала выключэнне `HttpException` .

Вось прыклад перавызначэння ўсяго цела адказу і ўказання прычыны памылкі:

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}
```

Выкарыстоўваючы вышэйсказанае, вось як будзе выглядаць адказ:

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

## Карыстальніцкія выключэнні

У многіх выпадках вам не трэба будзе пісаць карыстальніцкія выключэнні, і вы можаце выкарыстоўваць убудаванае выключэнне Nest HTTP, як апісана ў наступным раздзеле. Калі вам трэба стварыць наладжвальныя выключэнні, добрай практыкай будзе стварыць уласную **іерархію выключэнняў** , дзе вашы наладжвальныя выключэнні ўспадкуюць ад базавага класа `HttpException` . Пры такім падыходзе Nest распазнае вашы выключэнні і аўтаматычна паклапоціцца пра адказы на памылкі. Давайце рэалізуем такое карыстацкае выключэнне:

```typescript
@@filename(forbidden.exception)
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

Паколькі `ForbiddenException` пашырае базавы `HttpException` , ён будзе бесперашкодна працаваць з убудаваным апрацоўшчыкам выключэнняў, і таму мы можам выкарыстоўваць яго ўнутры метаду `findAll()` .

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

## Убудаваныя выключэнні HTTP

Nest забяспечвае набор стандартных выключэнняў, якія ўспадкоўваюцца ад базавага `HttpException` . Яны прадстаўлены з пакета `@nestjs/common` і ўяўляюць сабой многія найбольш распаўсюджаныя выключэнні HTTP:

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

Усе ўбудаваныя выключэнні таксама могуць даць як `cause` памылкі, так і апісанне памылкі з дапамогай параметра `options` :

```typescript
throw new BadRequestException('Something bad happened', { cause: new Error(), description: 'Some error description' })
```

Выкарыстоўваючы вышэйсказанае, вось як будзе выглядаць адказ:

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400,
}
```

## Фільтры выключэнняў

У той час як базавы (убудаваны) фільтр выключэнняў можа аўтаматычна апрацоўваць многія выпадкі за вас, вам можа спатрэбіцца **поўны кантроль** над узроўнем выключэнняў. Напрыклад, вы можаце дадаць вядзенне журналаў або выкарыстоўваць іншую схему JSON на аснове некаторых дынамічных фактараў. **Фільтры выключэнняў** прызначаны менавіта для гэтай мэты. Яны дазваляюць кантраляваць дакладны паток кіравання і змест адказу, адпраўленага кліенту.

Давайце створым фільтр выключэнняў, які адказвае за перахоп выключэнняў, якія з'яўляюцца асобнікамі класа `HttpException` , і рэалізацыю карыстацкай логікі адказу для іх. Для гэтага нам спатрэбіцца атрымаць доступ да аб'ектаў `Request` і `Response` базавай платформы. Мы атрымаем доступ да аб'екта `Request` , каб атрымаць зыходны `url` і ўключыць яго ў інфармацыю для рэгістрацыі. Мы будзем выкарыстоўваць аб'ект `Response` для непасрэднага кантролю над адпраўленым адказам з дапамогай метаду `response.json()` .

```typescript
@@filename(http-exception.filter)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
@@switch
import { Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

:::info **Падказка** Усе фільтры выключэнняў павінны рэалізоўваць агульны інтэрфейс `ExceptionFilter<T>` . Гэта патрабуе ад вас падаць метад `catch(exception: T, host: ArgumentsHost)` з указанай сігнатурай. `T` паказвае тып выключэння. :::

:::warning **Папярэджанне** Калі вы выкарыстоўваеце `@nestjs/platform-fastify` вы можаце выкарыстоўваць `response.send()` замест `response.json()` . Не забудзьцеся імпартаваць правільныя тыпы з `fastify` . :::

Дэкаратар `@Catch(HttpException)` звязвае неабходныя метаданыя з фільтрам выключэнняў, паведамляючы Nest, што гэты канкрэтны фільтр шукае выключэнні тыпу `HttpException` і нічога іншага. Дэкаратар `@Catch()` можа прымаць адзін параметр або спіс, падзелены коскамі. Гэта дазваляе наладзіць фільтр адначасова для некалькіх тыпаў выключэнняў.

## Аргументы гаспадара

Давайце паглядзім на параметры метаду `catch()` . Параметр `exception` - гэта аб'ект выключэння, які зараз апрацоўваецца. Параметр `host` - гэта аб'ект `ArgumentsHost` . `ArgumentsHost` - гэта магутны ўтылітны аб'ект, які мы разгледзім далей у [раздзеле аб кантэксце выканання](/fundamentals/execution-context) *. У гэтым узоры кода мы выкарыстоўваем яго для атрымання спасылкі на аб'екты `Request` і `Response` , якія перадаюцца першапачатковаму апрацоўшчыку запытаў (у кантролеры, дзе ўзнікае выключэнне). У гэтым узоры кода мы выкарыстоўвалі некаторыя дапаможныя метады на `ArgumentsHost` , каб атрымаць жаданыя аб'екты `Request` і `Response` . Даведайцеся больш пра `ArgumentsHost` [тут](/fundamentals/execution-context) .

*Прычына гэтага ўзроўню абстракцыі заключаецца ў тым, што `ArgumentsHost` функцыянуе ва ўсіх кантэкстах (напрыклад, у кантэксце HTTP-сервера, з якім мы зараз працуем, а таксама ў мікрасэрвісах і WebSockets). У раздзеле аб кантэксце выканання мы паглядзім, як мы можам атрымаць доступ да адпаведных <a href="https://docs.nestjs.com/fundamentals/execution-context#host-methods">асноўных аргументаў</a> для **любога** кантэксту выканання з дапамогай магутнасці `ArgumentsHost` і яго дапаможных функцый. Гэта дазволіць нам напісаць агульныя фільтры выключэнняў, якія працуюць ва ўсіх кантэкстах.

<app-banner-courses></app-banner-courses>

## Прывязка фільтраў

Давайце звяжам наш новы `HttpExceptionFilter` з метадам `create()` `CatsController` .

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
@@switch
@Post()
@UseFilters(new HttpExceptionFilter())
@Bind(Body())
async create(createCatDto) {
  throw new ForbiddenException();
}
```

:::info **Падказка** Дэкаратар `@UseFilters()` імпартаваны з пакета `@nestjs/common` . :::

Тут мы выкарыстоўвалі дэкаратар `@UseFilters()` . Падобна дэкаратару `@Catch()` , ён можа прымаць адзін асобнік фільтра або спіс асобнікаў фільтра, падзелены коскамі. Тут мы стварылі асобнік `HttpExceptionFilter` на месцы. У якасці альтэрнатывы вы можаце перадаць клас (замест асобніка), пакінуўшы адказнасць за стварэнне асобніка фрэймворку і ўключыўшы **ўкараненне залежнасці** .

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
@@switch
@Post()
@UseFilters(HttpExceptionFilter)
@Bind(Body())
async create(createCatDto) {
  throw new ForbiddenException();
}
```

:::info **Падказка** Аддавайце перавагу прымяненню фільтраў з выкарыстаннем класаў замест асобнікаў, калі гэта магчыма. Гэта памяншае **выкарыстанне памяці** , паколькі Nest можа лёгка паўторна выкарыстоўваць асобнікі аднаго класа ва ўсім вашым модулі. :::

У прыведзеным вышэй прыкладзе `HttpExceptionFilter` прымяняецца толькі да адзінага апрацоўшчыка маршруту `create()` , што робіць яго ахопленым метадам. Фільтры выключэнняў могуць быць ахоплены на розных узроўнях: у межах метаду кантролера/растваральніка/шлюза, у вобласці кантролера або ў глабальнай вобласці. Напрыклад, каб наладзіць фільтр як кантролер, вы павінны зрабіць наступнае:

```typescript
@@filename(cats.controller)
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

Гэтая канструкцыя наладжвае `HttpExceptionFilter` для кожнага апрацоўшчыка маршруту, вызначанага ўнутры `CatsController` .

Каб стварыць глабальны фільтр, вы павінны зрабіць наступнае:

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

::: **папярэджанне Папярэджанне** Метад `useGlobalFilters()` не наладжвае фільтры для шлюзаў або гібрыдных прыкладанняў. :::

Глабальныя фільтры выкарыстоўваюцца ва ўсім дадатку, для кожнага кантролера і кожнага апрацоўшчыка маршрутаў. З пункту гледжання ўкаранення залежнасцей, глабальныя фільтры, зарэгістраваныя па-за межамі любога модуля (з дапамогай `useGlobalFilters()` як у прыкладзе вышэй), не могуць уводзіць залежнасці, паколькі гэта робіцца па-за кантэкстам любога модуля. Каб вырашыць гэтую праблему, вы можаце зарэгістраваць глабальны фільтр **непасрэдна з любога модуля,** выкарыстоўваючы наступную канструкцыю:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

:::info **Падказка** Пры выкарыстанні гэтага падыходу для выканання ін'екцыі залежнасці для фільтра звярніце ўвагу, што незалежна ад модуля, у якім выкарыстоўваецца гэтая канструкцыя, фільтр, насамрэч, з'яўляецца глабальным. Дзе гэта рабіць? Выберыце модуль, дзе вызначаны фільтр ( `HttpExceptionFilter` у прыкладзе вышэй). Акрамя таго, `useClass` - не адзіны спосаб мець справу з карыстацкай рэгістрацыяй пастаўшчыка. Даведайцеся больш [тут](/fundamentals/custom-providers) . :::

Вы можаце дадаць колькі заўгодна фільтраў з дапамогай гэтай тэхнікі; проста дадайце кожны ў масіў пастаўшчыкоў.

## Злавіць усё

Каб перахапіць **кожнае** неапрацаванае выключэнне (незалежна ад тыпу выключэння), пакіньце спіс параметраў дэкаратара `@Catch()` пустым, напрыклад, `@Catch()` .

У прыведзеным ніжэй прыкладзе ў нас ёсць код, які не залежыць ад платформы, таму што ён выкарыстоўвае [HTTP-адаптар](./faq/http-adapter) для дастаўкі адказу і не выкарыстоўвае наўпрост ніякія спецыфічныя для платформы аб'екты ( `Request` і `Response` ):

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

::: **папярэджанне Папярэджанне** Пры спалучэнні фільтра выключэнняў, які ловіць усё, з фільтрам, прывязаным да пэўнага тыпу, спачатку павінен быць аб'яўлены фільтр «Злавіць што-небудзь», каб дазволіць канкрэтнаму фільтру правільна апрацоўваць звязаны тып. :::

## Спадчына

Як правіла, вы ствараеце цалкам індывідуальныя фільтры выключэнняў, створаныя ў адпаведнасці з патрабаваннямі вашага прыкладання. Аднак могуць быць выпадкі выкарыстання, калі вы захочаце проста пашырыць убудаваны стандартны **глабальны фільтр выключэнняў** і перавызначыць паводзіны на аснове пэўных фактараў.

Каб дэлегаваць апрацоўку выключэнняў базаваму фільтру, вам трэба пашырыць `BaseExceptionFilter` і выклікаць успадкаваны метад `catch()` .

```typescript
@@filename(all-exceptions.filter)
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}
```

:::папярэджанне **Папярэджанне** Фільтры з абласцямі метаду і кантролера, якія пашыраюць `BaseExceptionFilter` не павінны стварацца з `new` . Замест гэтага дазвольце фрэймворку ствараць іх аўтаматычна. :::

Глабальныя фільтры **могуць** пашыраць базавы фільтр. Гэта можна зрабіць адным з двух спосабаў.

Першы метад заключаецца ў увядзенні спасылкі `HttpAdapter` пры стварэнні асобніка карыстацкага глабальнага фільтра:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
```

Другі метад заключаецца ў выкарыстанні маркера `APP_FILTER` <a href="exception-filters#binding-filters">, як паказана тут</a> .
