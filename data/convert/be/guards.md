# Ахоўнікі

Ахоўнік - гэта клас, анатаваны дэкаратарам `@Injectable()` , які рэалізуе інтэрфейс `CanActivate` .

<figure><img src="/assets/Guards_1.png"></figure>

У ахоўнікаў **адна адказнасць** . Яны вызначаюць, ці будзе дадзены запыт апрацоўвацца апрацоўшчыкам маршруту ці не, у залежнасці ад пэўных умоў (напрыклад, дазволаў, роляў, спісаў ACL і г.д.), прысутных падчас выканання. Гэта часта называюць **аўтарызацыяй** . Аўтарызацыя (і яе стрыечны брат, **аўтэнтыфікацыя** , з якой яна звычайна супрацоўнічае) звычайна апрацоўваецца [прамежкавым праграмным забеспячэннем](/middleware) у традыцыйных праграмах Express. Прамежкавае праграмнае забеспячэнне з'яўляецца выдатным выбарам для аўтэнтыфікацыі, паколькі такія рэчы, як праверка токена і далучэнне уласцівасцей да аб'екта `request` , не моцна звязаны з пэўным кантэкстам маршруту (і яго метададзенымі).

Але прамежкавае праграмнае забеспячэнне па сваёй прыродзе тупое. Ён не ведае, які апрацоўшчык будзе выкананы пасля выкліку функцыі `next()` . З іншага боку, **Guards** маюць доступ да асобніка `ExecutionContext` і, такім чынам, дакладна ведаюць, што будзе выканана далей. Яны распрацаваны, падобна фільтрам выключэнняў, каналам і перахопнікам, каб дазволіць вам устаўляць логіку апрацоўкі ў патрэбны момант у цыкле запыту/адказу і рабіць гэта дэкларатыўна. Гэта дапамагае захаваць ваш код СУХІМ і дэкларатыўным.

:::info **Hint** Guards выконваюцца **пасля** ўсяго прамежкавага праграмнага забеспячэння, але **перад** любым перахопнікам або каналам. :::

## Ахоўнік аўтарызацыі

Як ужо згадвалася, **аўтарызацыя** з'яўляецца выдатным варыянтам выкарыстання Guards, таму што пэўныя маршруты павінны быць даступныя толькі тады, калі абанент (звычайна канкрэтны аўтэнтыфікаваны карыстальнік) мае дастатковыя дазволы. `AuthGuard` , які мы зараз пабудуем, прадугледжвае аўтэнтыфікацыю карыстальніка (і што, такім чынам, маркер далучаны да загалоўкаў запытаў). Ён здабудзе і праверыць токен і выкарыстае атрыманую інфармацыю, каб вызначыць, ці можа запыт працягвацца ці не.

```typescript
@@filename(auth.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

:::info **Падказка** Калі вы шукаеце рэальны прыклад таго, як рэалізаваць механізм аўтэнтыфікацыі ў вашым дадатку, наведайце [гэты раздзел](/security/authentication) . Сапраўды гэтак жа, каб атрымаць больш складаны прыклад аўтарызацыі, праверце [гэтую старонку](/security/authorization) . :::

Логіка ўнутры функцыі `validateRequest()` можа быць як простай, так і складанай па меры неабходнасці. Галоўная сутнасць гэтага прыкладу - паказаць, як ахоўнікі ўпісваюцца ў цыкл запытаў/адказаў.

Кожны ахоўнік павінен рэалізаваць функцыю `canActivate()` . Гэтая функцыя павінна вяртаць лагічнае значэнне, якое паказвае, дазволены бягучы запыт ці не. Ён можа вяртаць адказ сінхронна або асінхронна (праз `Promise` або `Observable` ). Nest выкарыстоўвае вяртанае значэнне для кіравання наступным дзеяннем:

- калі ён вяртае `true` , запыт будзе апрацаваны.
- калі ён верне `false` , Nest адхіліць запыт.

<app-banner-enterprise></app-banner-enterprise>

## Кантэкст выканання

Функцыя `canActivate()` прымае адзін аргумент, экзэмпляр `ExecutionContext` . `ExecutionContext` успадкоўваецца ад `ArgumentsHost` . Раней мы бачылі `ArgumentsHost` у раздзеле фільтраў выключэнняў. У прыведзеным вышэй узоры мы проста выкарыстоўваем тыя ж дапаможныя метады, вызначаныя на `ArgumentsHost` , што і раней, каб атрымаць спасылку на аб'ект `Request` . Вы можаце вярнуцца да раздзела **хоста аргументаў** главы [фільтраў выключэнняў](https://docs.nestjs.com/exception-filters#arguments-host) , каб даведацца больш па гэтай тэме.

Пашыраючы `ArgumentsHost` , `ExecutionContext` таксама дадае некалькі новых дапаможных метадаў, якія даюць дадатковыя звесткі аб бягучым працэсе выканання. Гэтыя дэталі могуць быць карыснымі пры стварэнні больш агульных ахоўнікаў, якія могуць працаваць у шырокім наборы кантролераў, метадаў і кантэкстаў выканання. Даведайцеся больш пра `ExecutionContext` [тут](/fundamentals/execution-context) .

## Аўтэнтыфікацыя на аснове роляў

Давайце пабудуем больш функцыянальны ахоўнік, які дазваляе доступ толькі карыстальнікам з пэўнай роляй. Мы пачнем з базавага шаблону ахоўніка і будзем абапірацца на яго ў наступных раздзелах. На дадзены момант гэта дазваляе выконваць усе запыты:

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard {
  canActivate(context) {
    return true;
  }
}
```

## Пераплёт ахоўнікаў

Як каналы і фільтры выключэнняў, ахоўнікі могуць быць **ахоплены кантролерам** , метадам або глабальным ахопам. Ніжэй мы наладзілі ахову ў межах кантролера з дапамогай дэкаратара `@UseGuards()` . Гэты дэкаратар можа прымаць адзін аргумент або спіс аргументаў, падзеленых коскамі. Гэта дазваляе вам лёгка прымяніць адпаведны набор ахоўнікаў з дапамогай адной дэкларацыі.

```typescript
@@filename()
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

:::info **Падказка** Дэкаратар `@UseGuards()` імпартаваны з пакета `@nestjs/common` . :::

Вышэй мы перадалі клас `RolesGuard` (замест асобніка), пакінуўшы адказнасць за стварэнне асобніка фрэймворку і дазволіўшы ін'екцыю залежнасці. Як і ў выпадку з каналамі і фільтрамі выключэнняў, мы таксама можам перадаць асобнік на месцы:

```typescript
@@filename()
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

Прыведзеная вышэй канструкцыя далучае ахову да кожнага апрацоўшчыка, заяўленага гэтым кантролерам. Калі мы хочам, каб гвардыя прымянялася толькі да аднаго метаду, мы ўжываем дэкаратар `@UseGuards()` на **ўзроўні метаду** .

Каб наладзіць глабальную варту, выкарыстоўвайце метад `useGlobalGuards()` асобніка прыкладання Nest:

```typescript
@@filename()
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

:::warning **Заўвага** У выпадку гібрыдных праграм метад `useGlobalGuards()` не ўстанаўлівае ахоўнікаў для шлюзаў і мікрасэрвісаў па змаўчанні (гл. [Гібрыднае прыкладанне](/faq/hybrid-application) для атрымання інфармацыі аб тым, як змяніць гэтыя паводзіны). Для «стандартных» (негібрыдных) мікрасэрвісных праграм `useGlobalGuards()` усталёўвае ахоўнікаў глабальна. :::

Глабальныя ахоўнікі выкарыстоўваюцца ва ўсім дадатку, для кожнага кантролера і кожнага апрацоўшчыка маршрутаў. Што тычыцца ўкаранення залежнасцей, глабальныя ахоўнікі, зарэгістраваныя па-за межамі любога модуля (з дапамогай `useGlobalGuards()` як у прыкладзе вышэй), не могуць уводзіць залежнасці, паколькі гэта робіцца па-за кантэкстам любога модуля. Каб вырашыць гэтую праблему, вы можаце ўсталяваць ахову непасрэдна з любога модуля, выкарыстоўваючы наступную канструкцыю:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

:::info **Падказка** Пры выкарыстанні гэтага падыходу для ўвядзення залежнасці для ахоўніка звярніце ўвагу, што незалежна ад :::

> Модуль, дзе выкарыстоўваецца гэтая канструкцыя, вартаўнік, па сутнасці, глабальны. Дзе гэта рабіць? Выберыце модуль, у якім вызначаны ахоўнік ( `RolesGuard` у прыкладзе вышэй). Акрамя таго, `useClass` - не адзіны спосаб мець справу з карыстацкай рэгістрацыяй пастаўшчыка. Даведайцеся больш [тут](/fundamentals/custom-providers) .

## Налада роляў для кожнага апрацоўшчыка

Наш `RolesGuard` працуе, але пакуль не вельмі разумны. Мы яшчэ не выкарыстоўваем самую важную функцыю аховы - [кантэкст выканання](/fundamentals/execution-context) . Ён яшчэ не ведае аб ролях або якія ролі дазволены для кожнага апрацоўшчыка. `CatsController` , напрыклад, можа мець розныя схемы дазволаў для розных маршрутаў. Некаторыя могуць быць даступныя толькі для карыстальнікаў-адміністратараў, а іншыя могуць быць адкрыты для ўсіх. Як мы можам супаставіць ролі з маршрутамі гнуткім і шматразовым спосабам?

Вось дзе **карыстальніцкія метададзеныя** ўступаюць у гульню (даведацца больш [тут](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata) ). Nest дае магчымасць далучаць карыстальніцкія **метаданыя** да апрацоўшчыкаў маршрутаў праз дэкаратары, створаныя праз статычны метад `Reflector#createDecorator` , або ўбудаваны дэкаратар `@SetMetadata()` .

Напрыклад, давайце створым дэкаратар `@Roles()` з дапамогай метаду `Reflector#createDecorator` , які далучыць метададзеныя да апрацоўшчыка. `Reflector` пастаўляецца ў фрэймворку з пакета `@nestjs/core` .

```ts
@@filename(roles.decorator)
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

Дэкаратар `Roles` тут - гэта функцыя, якая прымае адзін аргумент тыпу `string[]` .

Цяпер, каб выкарыстоўваць гэты дэкаратар, мы проста анатаваем апрацоўшчык з ім:

```typescript
@@filename(cats.controller)
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles(['admin'])
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

Тут мы далучылі метададзеныя дэкаратара `Roles` да метаду `create()` , паказваючы, што толькі карыстальнікі з роляй `admin` павінны мець доступ да гэтага маршруту.

У якасці альтэрнатывы, замест выкарыстання метаду `Reflector#createDecorator` , мы маглі б выкарыстоўваць убудаваны дэкаратар `@SetMetadata()` . Даведайцеся больш пра [тут](/fundamentals/execution-context#low-level-approach) .

## Збіраючы ўсё разам

Давайце зараз вернемся і звяжам гэта разам з нашым `RolesGuard` . У цяперашні час ён проста вяртае `true` ва ўсіх выпадках, дазваляючы выканаць кожны запыт. Мы хочам зрабіць вяртанае значэнне ўмоўным на аснове параўнання **роляў, прызначаных бягучаму карыстальніку,** з рэальнымі ролямі, неабходнымі для бягучага маршруту, які апрацоўваецца. Каб атрымаць доступ да ролі (ролей) маршрута (карыстальніцкія метададзеныя), мы зноў будзем выкарыстоўваць дапаможны клас `Reflector` наступным чынам:

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

:::info **Падказка** У свеце node.js звычайная практыка далучаць аўтарызаванага карыстальніка да аб'екта `request` . Такім чынам, у нашым прыкладзе кода вышэй, мы мяркуем, што `request.user` змяшчае асобнік карыстальніка і дазволеныя ролі. У вашым дадатку вы, верагодна, зробіце такую ​​сувязь у карыстальніцкай **ахове аўтэнтыфікацыі** (ці прамежкавым ПЗ). Праверце [гэты раздзел](/security/authentication) для атрымання дадатковай інфармацыі па гэтай тэме. :::

:::warning **Папярэджанне** Логіка ўнутры функцыі `matchRoles()` можа быць як простай, так і складанай па меры неабходнасці. Галоўная сутнасць гэтага прыкладу - паказаць, як ахоўнікі ўпісваюцца ў цыкл запытаў/адказаў. :::

Звярніцеся да раздзела <a href="https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata">«Адлюстраванне і метададзеныя»</a> главы **«Кантэкст выканання»** для атрымання больш падрабязнай інфармацыі аб выкарыстанні `Reflector` кантэкстна-залежным спосабам.

Калі карыстальнік з недастатковымі прывілеямі запытвае канечную кропку, Nest аўтаматычна вяртае наступны адказ:

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

Звярніце ўвагу, што за кулісамі, калі ахоўнік вяртае `false` , фрэймворк стварае `ForbiddenException` . Калі вы хочаце вярнуць іншы адказ на памылку, вы павінны стварыць сваё ўласнае выключэнне. Напрыклад:

```typescript
throw new UnauthorizedException();
```

Любое выключэнне, створанае ахоўнікам, будзе апрацоўвацца [ўзроўнем выключэнняў](/exception-filters) (глабальны фільтр выключэнняў і любыя фільтры выключэнняў, якія прымяняюцца да бягучага кантэксту).

:::info **Падказка** Калі вы шукаеце рэальны прыклад таго, як рэалізаваць аўтарызацыю, прачытайце [гэты раздзел](/security/authorization) . :::
