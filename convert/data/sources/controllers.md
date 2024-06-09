# Кантралёры

Кантралёры адказваюць за апрацоўку ўваходных **запытаў** і вяртанне **адказаў** кліенту.

<figure><img src="/assets/Controllers_1.png"></figure>

Мэта кантролера - атрымліваць канкрэтныя запыты для прыкладання. Механізм **маршрутызацыі** кантралюе, які кантролер атрымлівае якія запыты. Часта кожны кантролер мае больш чым адзін маршрут, і розныя маршруты могуць выконваць розныя дзеянні.

Каб стварыць базавы кантролер, мы выкарыстоўваем класы і **дэкаратары** . Дэкаратары звязваюць класы з неабходнымі метададзенымі і дазваляюць Nest ствараць карту маршрутызацыі (прывязваць запыты да адпаведных кантролераў).

:::info **Падказка** Для хуткага стварэння CRUD-кантролера з убудаванай [праверкай](https://docs.nestjs.com/techniques/validation) вы можаце выкарыстоўваць [CRUD-генератар](https://docs.nestjs.com/recipes/crud-generator#crud-generator) CLI: `nest g resource [name]` . :::

## Маршрутызацыя

У наступным прыкладзе мы будзем выкарыстоўваць дэкаратар `@Controller()` , **неабходны** для вызначэння базавага кантролера. Мы ўкажам неабавязковы прэфікс шляху шляху `cats` . Выкарыстанне прэфікса шляху ў дэкаратары `@Controller()` дазваляе нам лёгка згрупаваць набор звязаных маршрутаў і звесці да мінімуму паўтаральны код. Напрыклад, мы можам згрупаваць набор маршрутаў, якія кіруюць узаемадзеяннем з аб'ектам cat пад маршрутам `/cats` . У такім выпадку мы маглі б пазначыць прэфікс шляху `cats` у дэкаратары `@Controller()` , каб нам не прыйшлося паўтараць гэтую частку шляху для кожнага маршруту ў файле.

```typescript
@@filename(cats.controller)
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

:::info **Падказка** Каб стварыць кантролер з дапамогай CLI, проста выканайце каманду `$ nest g controller [name]` . :::

Дэкаратар метаду HTTP-запыту `@Get()` перад метадам `findAll()` загадвае Nest стварыць апрацоўшчык для пэўнай канчатковай кропкі для HTTP-запытаў. Канчатковы пункт адпавядае метаду запыту HTTP (у дадзеным выпадку GET) і шляху маршруту. Які шлях маршруту? Маршрутны шлях для апрацоўшчыка вызначаецца шляхам канкатэнацыі (неабавязковага) прэфікса, аб'яўленага для кантролера, і любога шляху, указанага ў дэкаратары метаду. Паколькі мы аб'явілі прэфікс для кожнага маршруту ( `cats` ) і не дадалі ніякай інфармацыі аб шляху ў дэкаратар, Nest будзе супастаўляць запыты `GET /cats` з гэтым апрацоўшчыкам. Як ужо згадвалася, шлях уключае як неабавязковы прэфікс шляху кантролера **, так і** любы радок шляху, аб'яўлены ў дэкаратары метаду запыту. Напрыклад, прэфікс шляху `cats` у спалучэнні з дэкаратарам `@Get('breed')` будзе ствараць адлюстраванне маршруту для такіх запытаў, як `GET /cats/breed` .

У нашым прыкладзе вышэй, калі да гэтай канчатковай кропкі робіцца запыт GET, Nest накіроўвае запыт да вызначанага карыстальнікам метаду `findAll()` . Звярніце ўвагу, што імя метаду, якое мы выбіраем тут, абсалютна адвольнае. Відавочна, што мы павінны аб'явіць метад для прывязкі маршруту, але Nest не надае ніякага значэння абранай назве метаду.

Гэты метад верне код стану 200 і адпаведны адказ, які ў дадзеным выпадку з'яўляецца проста радком. Чаму так адбываецца? Каб патлумачыць, спачатку мы прадставім канцэпцыю, што Nest выкарыстоўвае два **розныя** варыянты маніпулявання адказамі:

<table>
  <tr>
    <td>Стандарт (рэкамендуецца)</td>
    <td>       З дапамогай гэтага ўбудаванага метаду, калі апрацоўшчык запытаў вяртае аб'ект або масіў JavaScript, ён будзе <strong>аўтаматычна</strong> серыялізаваны ў JSON. Аднак калі ён вяртае прымітыўны тып JavaScript (напрыклад, <code>string</code> , <code>number</code> , <code>boolean</code> ), Nest адправіць толькі значэнне без спробы яго серыялізацыі. Гэта робіць апрацоўку адказу простай: проста вярніце значэнне, а Nest паклапоціцца пра ўсё астатняе.<br><br> Акрамя таго, <strong>код стану</strong> адказу заўсёды роўны 200 па змаўчанні, за выключэннем запытаў POST, якія выкарыстоўваюць 201. Мы можам лёгка змяніць гэтыя паводзіны, дадаўшы дэкаратар <code>@HttpCode(...)</code> на ўзроўні апрацоўшчыка (гл. <a href="controllers#status-code">Коды стану</a> ).     </td>
  </tr>
  <tr>
    <td>Спецыфіка бібліятэкі</td>
    <td>       Мы можам выкарыстоўваць спецыфічны для бібліятэкі (напрыклад, Express) <a href="https://expressjs.com/en/api.html#res" rel="nofollow" target="_blank">аб'ект адказу</a> , які можа быць уведзены з дапамогай дэкаратара <code>@Res()</code> у сігнатуры апрацоўшчыка метаду (напрыклад, <code>findAll(@Res() response)</code> ). Пры такім падыходзе ў вас ёсць магчымасць выкарыстоўваць уласныя метады апрацоўкі адказаў, адкрытыя гэтым аб'ектам. Напрыклад, з дапамогай Express вы можаце будаваць адказы з дапамогай кода накшталт <code>response.status(200).send()</code> .     </td>
  </tr>
</table>

::: **папярэджанне Папярэджанне** Nest вызначае, калі апрацоўшчык выкарыстоўвае `@Res()` або `@Next()` , паказваючы, што вы выбралі спецыфічную для бібліятэкі опцыю. Калі абодва падыходы выкарыстоўваюцца адначасова, стандартны падыход **аўтаматычна адключаецца** для гэтага адзінага маршруту і больш не будзе працаваць належным чынам. Каб выкарыстоўваць абодва падыходы адначасова (напрыклад, шляхам увядзення аб'екта адказу, каб усталяваць толькі кукі/загалоўкі, а ўсё астатняе пакінуць фрэймворку), вы павінны ўсталяваць для параметра `passthrough` значэнне `true` у `@Res({{ '{' }} passthrough: true {{ '}' }})` дэкаратар. :::

<app-banner-devtools></app-banner-devtools>

## Аб'ект запыту

Апрацоўшчыкам часта патрабуецца доступ да дэталяў **запыту** кліента. Nest забяспечвае доступ да [аб'екта запыту](https://expressjs.com/en/api.html#req) базавай платформы (па змаўчанні - Express). Мы можам атрымаць доступ да аб'екта запыту, даручыўшы Nest увесці яго, дадаўшы дэкаратар `@Req()` у подпіс апрацоўшчыка.

```typescript
@@filename(cats.controller)
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Bind, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  @Bind(Req())
  findAll(request) {
    return 'This action returns all cats';
  }
}
```

:::info **Падказка** Каб скарыстацца перавагамі `express` ўводу (як у прыкладзе `request: Request` вышэй), усталюйце пакет `@types/express` . :::

Аб'ект запыту прадстаўляе запыт HTTP і мае ўласцівасці для радка запыту запыту, параметраў, загалоўкаў HTTP і цела (падрабязней [тут](https://expressjs.com/en/api.html#req) ). У большасці выпадкаў няма неабходнасці захопліваць гэтыя ўласцівасці ўручную. Замест гэтага мы можам выкарыстоўваць спецыяльныя дэкаратары, такія як `@Body()` або `@Query()` , якія даступныя з скрынкі. Ніжэй прыведзены спіс прадастаўленых дэкаратараў і простых аб'ектаў, характэрных для платформы, якія яны прадстаўляюць.

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td>
</tr>
    <tr>
      <td>
<code>@Response(), @Res()</code><span class="table-code-asterisk">*</span>
</td>
      <td><code>res</code></td>
    </tr>
    <tr>
      <td><code>@Next()</code></td>
      <td><code>next</code></td>
    </tr>
    <tr>
      <td><code>@Session()</code></td>
      <td><code>req.session</code></td>
    </tr>
    <tr>
      <td><code>@Param(key?: string)</code></td>
      <td>
<code>req.params</code> / <code>req.params[key]</code>
</td>
    </tr>
    <tr>
      <td><code>@Body(key?: string)</code></td>
      <td>
<code>req.body</code> / <code>req.body[key]</code>
</td>
    </tr>
    <tr>
      <td><code>@Query(key?: string)</code></td>
      <td>
<code>req.query</code> / <code>req.query[key]</code>
</td>
    </tr>
    <tr>
      <td><code>@Headers(name?: string)</code></td>
      <td>
<code>req.headers</code> / <code>req.headers[name]</code>
</td>
    </tr>
    <tr>
      <td><code>@Ip()</code></td>
      <td><code>req.ip</code></td>
    </tr>
    <tr>
      <td><code>@HostParam()</code></td>
      <td><code>req.hosts</code></td>
    </tr>
  </tbody>
</table>

<sup>*</sup> Для сумяшчальнасці з уводам на базавых платформах HTTP (напрыклад, Express і Fastify) Nest забяспечвае дэкаратары `@Res()` і `@Response()` . `@Res()` - гэта проста псеўданім для `@Response()` . Абодва непасрэдна раскрываюць асноўны інтэрфейс аб'екта `response` ўласнай платформы. Пры іх выкарыстанні вы таксама павінны імпартаваць тыпізацыю для асноўнай бібліятэкі (напрыклад, `@types/express` ), каб атрымаць усе перавагі. Звярніце ўвагу, што калі вы ўстаўляеце `@Res()` або `@Response()` у апрацоўшчык метаду, вы пераводзіце Nest у **спецыфічны для бібліятэкі рэжым** для гэтага апрацоўшчыка, і вы становіцеся адказным за кіраванне адказам. Пры гэтым вы павінны даць нейкі адказ, зрабіўшы выклік аб'екта `response` (напрыклад, `res.json(...)` або `res.send(...)` ), інакш сервер HTTP завісне.

:::info **Падказка** Каб даведацца, як ствараць свае ўласныя дэкаратары, наведайце [гэты](/custom-decorators) раздзел. :::

## Рэсурсы

Раней мы вызначылі канечную кропку для атрымання рэсурсу cats (маршрут **GET** ). Звычайна мы таксама хочам забяспечыць канечную кропку, якая стварае новыя запісы. Для гэтага давайце створым апрацоўшчык **POST** :

```typescript
@@filename(cats.controller)
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
@@switch
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {
    return 'This action adds a new cat';
  }

  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

Гэта так проста. Nest забяспечвае дэкаратары для ўсіх стандартных метадаў HTTP: `@Get()` , `@Post()` , `@Put()` , `@Delete()` , `@Patch()` , `@Options()` і `@Head()` . Акрамя таго, `@All()` вызначае канечную кропку, якая апрацоўвае ўсе з іх.

## Падстаноўныя знакі маршруту

Таксама падтрымліваюцца маршруты на аснове шаблонаў. Напрыклад, зорачка выкарыстоўваецца як сімвал падстаноўкі і будзе адпавядаць любой камбінацыі сімвалаў.

```typescript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```

Шлях маршруту `'ab*cd'` будзе адпавядаць `abcd` , `ab_cd` , `abecd` і гэтак далей. Персанажы `?` , `+` , `*` і `()` могуць выкарыстоўвацца ў шляху маршруту і з'яўляюцца падмноствамі сваіх аналагаў рэгулярных выразаў. Злучок ( `-` ) і кропка ( `.` ) інтэрпрэтуюцца літаральна шляхамі на аснове радкоў.

:::папярэджанне **Папярэджанне** Падстаноўны знак у сярэдзіне маршруту падтрымліваецца толькі экспрэс. :::

## Код стану

Як ужо згадвалася, **код статусу** адказу заўсёды роўны **200** па змаўчанні, за выключэннем запытаў POST, якія роўны **201** . Мы можам лёгка змяніць гэтыя паводзіны, дадаўшы дэкаратар `@HttpCode(...)` на ўзроўні апрацоўшчыка.

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

:::info **Падказка** Імпарт `HttpCode` з пакета `@nestjs/common` . :::

Часта ваш код стану не статычны, а залежыць ад розных фактараў. У такім выпадку вы можаце выкарыстоўваць аб'ект **адказу** для бібліятэкі (ін'екцыя з дапамогай `@Res()` ) (або, у выпадку памылкі, выклікаць выключэнне).

## Загалоўкі

Каб задаць карыстальніцкі загаловак адказу, вы можаце выкарыстоўваць дэкаратар `@Header()` або спецыфічны для бібліятэкі аб'ект адказу (і выклікаць `res.header()` непасрэдна).

```typescript
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

:::info **Падказка** Імпартаваць `Header` з пакета `@nestjs/common` . :::

## Перанакіраванне

Каб перанакіраваць адказ на пэўны URL, вы можаце выкарыстоўваць дэкаратар `@Redirect()` або спецыфічны для бібліятэкі аб'ект адказу (і выклікаць `res.redirect()` непасрэдна).

`@Redirect()` прымае два аргументы, `url` і `statusCode` , абодва неабавязковыя. Значэнне па змаўчанні `statusCode` роўна `302` ( `Found` ), калі яно апушчана.

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

:::info **Падказка** Часам вы можаце дынамічна вызначаць код стану HTTP або URL перанакіравання. Зрабіце гэта, вярнуўшы аб'ект пасля інтэрфейсу `HttpRedirectResponse` (з `@nestjs/common` ). :::

Вернутыя значэнні будуць перавызначаць любыя аргументы, перададзеныя дэкаратару `@Redirect()` . Напрыклад:

```typescript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```

## Параметры маршруту

Маршруты са статычнымі шляхамі не будуць працаваць, калі вам трэба прыняць **дынамічныя дадзеныя** як частку запыту (напрыклад, `GET /cats/1` каб атрымаць котку з ідэнтыфікатарам `1` ). Каб вызначыць маршруты з параметрамі, мы можам дадаць **маркеры** параметраў маршруту ў шлях маршруту, каб захапіць дынамічнае значэнне ў гэтай пазіцыі ў URL-адрасе запыту. Токен параметра маршруту ў прыкладзе дэкаратара `@Get()` дэманструе такое выкарыстанне. Параметры маршруту, заяўленыя такім чынам, могуць быць даступныя з дапамогай дэкаратара `@Param()` , які трэба дадаць у подпіс метаду.

:::info **Падказка** Маршруты з параметрамі павінны быць аб'яўлены пасля любых статычных шляхоў. Гэта прадухіляе параметрізаваныя шляхі ад перахопу трафіку, прызначанага для статычных шляхоў. :::

```typescript
@@filename()
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
@@switch
@Get(':id')
@Bind(Param())
findOne(params) {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` выкарыстоўваецца для ўпрыгожвання параметра метаду ( `params` у прыкладзе вышэй) і робіць параметры **маршрута** даступнымі ў якасці ўласцівасцей гэтага параметра ўпрыгожанага метаду ўнутры цела метаду. Як відаць у кодзе вышэй, мы можам атрымаць доступ да параметру `id` , спасылаючыся на `params.id` . Вы таксама можаце перадаць пэўны токен параметра ў дэкаратар, а затым спасылацца на параметр маршруту непасрэдна па імені ў целе метаду.

:::info **Падказка** Імпартаваць `Param` з пакета `@nestjs/common` . :::

```typescript
@@filename()
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
@@switch
@Get(':id')
@Bind(Param('id'))
findOne(id) {
  return `This action returns a #${id} cat`;
}
```

## Маршрутызацыя субдамена

Дэкаратар `@Controller` можа выкарыстоўваць параметр `host` , каб патрабаваць, каб хост HTTP ўваходных запытаў адпавядаў пэўнаму значэнню.

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

:::небяспека **Папярэджанне** Паколькі **ў Fastify** адсутнічае падтрымка ўкладзеных маршрутызатараў, пры выкарыстанні субдаменнай маршрутызацыі замест гэтага варта выкарыстоўваць (па змаўчанні) адаптар Express. :::

Падобна `path` маршруту, параметр `hosts` можа выкарыстоўваць токены для фіксацыі дынамічнага значэння ў гэтай пазіцыі ў імені хоста. Маркер параметра хаста ў прыкладзе дэкаратара `@Controller()` ніжэй дэманструе такое выкарыстанне. Параметры хаста, аб'яўленыя такім чынам, могуць быць даступныя з дапамогай дэкаратара `@HostParam()` , які трэба дадаць у подпіс метаду.

```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

## Сферы прыцэла

Для людзей, якія паходзяць з розных моў праграмавання, можа быць нечаканым даведацца, што ў Nest амаль усё абагульваецца паміж уваходнымі запытамі. У нас ёсць пул злучэнняў з базай дадзеных, адзінкавыя сэрвісы з глабальным станам і г. д. Памятайце, што Node.js не прытрымліваецца шматструменнай мадэлі без захавання стану запыту/адказу, у якой кожны запыт апрацоўваецца асобным патокам. Такім чынам, выкарыстанне адзіночных асобнікаў цалкам **бяспечна** для нашых прыкладанняў.

Аднак бываюць крайнія выпадкі, калі час жыцця кантролера на аснове запытаў можа быць жаданым, напрыклад, кэшаванне кожнага запыту ў праграмах GraphQL, адсочванне запытаў або мультыарэнда. Даведайцеся, як кіраваць прыцэлам [тут](/fundamentals/injection-scopes) .

## Асінхроннасць

Мы любім сучасны JavaScript і ведаем, што здабыча даных у асноўным **асінхронная** . Вось чаму Nest падтрымлівае і добра працуе з `async` функцыямі.

:::info **Падказка** Даведайцеся больш пра функцыю `async / await` [тут](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await) :::

Кожная асінхронная функцыя павінна вяртаць `Promise` . Гэта азначае, што вы можаце вярнуць адкладзенае значэнне, якое Nest зможа вырашыць самастойна. Давайце паглядзім прыклад гэтага:

```typescript
@@filename(cats.controller)
@Get()
async findAll(): Promise<any[]> {
  return [];
}
@@switch
@Get()
async findAll() {
  return [];
}
```

Прыведзены вышэй код цалкам сапраўдны. Акрамя таго, апрацоўшчыкі маршрутаў Nest яшчэ больш магутныя, бо могуць вяртаць [патокі, якія назіраюцца](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html) RxJS. Nest аўтаматычна падпішацца на крыніцу ніжэй і прыме апошняе выпушчанае значэнне (пасля завяршэння трансляцыі).

```typescript
@@filename(cats.controller)
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
@@switch
@Get()
findAll() {
  return of([]);
}
```

Абодва вышэйпералічаныя падыходы працуюць, і вы можаце выкарыстоўваць усё, што адпавядае вашым патрабаванням.

## Запыт карысных нагрузак

Наш папярэдні прыклад апрацоўшчыка маршрутаў POST не прымаў ніякіх кліенцкіх параметраў. Давайце выправім гэта, дадаўшы сюды дэкаратар `@Body()` .

Але спачатку (калі вы выкарыстоўваеце TypeScript), нам трэба вызначыць схему **DTO** (аб'ект перадачы даных). DTO - гэта аб'ект, які вызначае спосаб адпраўкі даных па сетцы. Мы маглі б вызначыць схему DTO з дапамогай інтэрфейсаў **TypeScript** або простых класаў. Цікава, што мы рэкамендуем выкарыстоўваць тут **класы** . чаму? Класы з'яўляюцца часткай стандарту JavaScript ES6, і таму яны захоўваюцца як рэальныя аб'екты ў скампіляваным JavaScript. З іншага боку, паколькі інтэрфейсы TypeScript выдаляюцца падчас транспіляцыі, Nest не можа звяртацца да іх падчас выканання. Гэта важна, таму што такія функцыі, як **Pipes,** адкрываюць дадатковыя магчымасці, калі яны маюць доступ да метатыпу зменнай падчас выканання.

Давайце створым клас `CreateCatDto` :

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Ён валодае ўсяго трыма асноўнымі ўласцівасцямі. Пасля гэтага мы можам выкарыстоўваць толькі што створаны DTO ўнутры `CatsController` :

```typescript
@@filename(cats.controller)
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
@@switch
@Post()
@Bind(Body())
async create(createCatDto) {
  return 'This action adds a new cat';
}
```

:::info **Падказка** Наш `ValidationPipe` можа адфільтраваць уласцівасці, якія не павінны быць атрыманы апрацоўшчыкам метаду. У гэтым выпадку мы можам занесці прымальныя ўласцівасці ў белы спіс, і любая ўласцівасць, не ўключаная ў белы спіс, аўтаматычна выдаляецца з атрыманага аб'екта. У прыкладзе `CreateCatDto` наш белы спіс - гэта ўласцівасці `name` , `age` і `breed` . Даведайцеся больш [тут](https://docs.nestjs.com/techniques/validation#stripping-properties) . :::

## Апрацоўка памылак

[Тут](/exception-filters) ёсць асобная глава пра апрацоўку памылак (г.зн. працу з выключэннямі).

## Поўны ўзор рэсурсу

Ніжэй прыведзены прыклад, які выкарыстоўвае некалькі даступных дэкаратараў для стварэння базавага кантролера. Гэты кантролер прапануе некалькі метадаў доступу да ўнутраных даных і маніпулявання імі.

```typescript
@@filename(cats.controller)
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
@@switch
import { Controller, Get, Query, Post, Body, Put, Param, Delete, Bind } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  @Bind(Body())
  create(createCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  @Bind(Query())
  findAll(query) {
    console.log(query);
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  @Bind(Param('id'))
  findOne(id) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  @Bind(Param('id'), Body())
  update(id, updateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return `This action removes a #${id} cat`;
  }
}
```

:::info **Hint** Nest CLI забяспечвае генератар (схему), які аўтаматычна генеруе **ўвесь шаблонны код** , каб дапамагчы нам пазбегнуць усяго гэтага і зрабіць працу распрацоўшчыка значна прасцейшай. Падрабязней аб гэтай функцыі чытайце [тут](/recipes/crud-generator) . :::

## Устаючы і бегчы

Калі вышэйзгаданы кантролер цалкам вызначаны, Nest усё яшчэ не ведае, што `CatsController` існуе, і ў выніку не стварае асобнік гэтага класа.

Кантролеры заўсёды належаць да модуля, таму мы ўключаем масіў `controllers` у дэкаратар `@Module()` . Паколькі мы яшчэ не вызначылі ніякіх іншых модуляў, акрамя каранёвага `AppModule` , мы будзем выкарыстоўваць яго, каб прадставіць `CatsController` :

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

Мы далучылі метаданыя да класа модуля з дапамогай дэкаратара `@Module()` , і цяпер Nest можа лёгка вызначыць, якія кантролеры трэба ўсталяваць.

## Бібліятэчна-спецыфічны падыход

Да гэтага часу мы абмяркоўвалі стандартны спосаб Nest маніпулявання адказамі. Другі спосаб маніпулявання адказам - выкарыстанне бібліятэчнага [аб'екта адказу](https://expressjs.com/en/api.html#res) . Для таго, каб увесці пэўны аб'ект адказу, нам трэба выкарыстоўваць дэкаратар `@Res()` . Каб паказаць адрозненні, давайце перапішам `CatsController` да наступнага:

```typescript
@@filename()
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}
@@switch
import { Controller, Get, Post, Bind, Res, Body, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  @Bind(Res(), Body())
  create(res, createCatDto) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  @Bind(Res())
  findAll(res) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

Нягледзячы на ​​тое, што гэты падыход працуе і сапраўды забяспечвае большую гібкасць у пэўным сэнсе, забяспечваючы поўны кантроль над аб'ектам адказу (маніпуляцыі з загалоўкамі, спецыфічныя функцыі бібліятэкі і г.д.), яго трэба выкарыстоўваць асцярожна. У цэлым гэты падыход значна менш зразумелы і мае некаторыя недахопы. Асноўным недахопам з'яўляецца тое, што ваш код становіцца залежным ад платформы (паколькі асноўныя бібліятэкі могуць мець розныя API для аб'екта адказу), і яго цяжэй праверыць (вам давядзецца здзекавацца з аб'екта адказу і г.д.).

Акрамя таго, у прыведзеным вышэй прыкладзе вы губляеце сумяшчальнасць з функцыямі Nest, якія залежаць ад стандартнай апрацоўкі адказаў Nest, такімі як перахопнікі і дэкаратары `@HttpCode()` / `@Header()` . Каб выправіць гэта, вы можаце ўсталяваць опцыю `passthrough` ў `true` наступным чынам:

```typescript
@@filename()
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
@@switch
@Get()
@Bind(Res({ passthrough: true }))
findAll(res) {
  res.status(HttpStatus.OK);
  return [];
}
```

Цяпер вы можаце ўзаемадзейнічаць з уласным аб'ектам адказу (напрыклад, усталёўваць файлы cookie або загалоўкі ў залежнасці ад пэўных умоў), але пакіньце ўсё астатняе фрэймворку.
