# Карыстальніцкія дэкаратары маршрутаў

Nest пабудавана вакол моўнай асаблівасці, званай **дэкаратарамі** . Дэкаратары - добра вядомае паняцце ў многіх часта выкарыстоўваюцца мовах праграмавання, але ў свеце JavaScript яны ўсё яшчэ адносна новыя. Каб лепш зразумець, як працуюць дэкаратары, раім прачытаць [гэты артыкул](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) . Вось простае вызначэнне:

<blockquote class="external">   Дэкаратар ES2016 - гэта выраз, які вяртае функцыю і можа прымаць мэту, імя і дэскрыптар уласцівасці ў якасці аргументаў. Вы ўжываеце яго, дадаўшы да дэкаратара сімвал <code>@</code> і размясціўшы яго ў самым версе таго, што вы спрабуеце ўпрыгожыць. Дэкаратары могуць быць вызначаны для класа, метаду або ўласцівасці. </blockquote>

## Дэкаратары параметраў

Nest прапануе набор карысных **дэкаратараў параметраў** , якія можна выкарыстоўваць разам з апрацоўшчыкамі маршрутаў HTTP. Ніжэй прыведзены спіс прадстаўленых дэкаратараў і простых аб'ектаў Express (або Fastify), якія яны прадстаўляюць

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td>
    </tr>
    <tr>
      <td><code>@Response(), @Res()</code></td>
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
      <td><code>@Param(param?: string)</code></td>
      <td>
<code>req.params</code> / <code>req.params[param]</code>
</td>
    </tr>
    <tr>
      <td><code>@Body(param?: string)</code></td>
      <td>
<code>req.body</code> / <code>req.body[param]</code>
</td>
    </tr>
    <tr>
      <td><code>@Query(param?: string)</code></td>
      <td>
<code>req.query</code> / <code>req.query[param]</code>
</td>
    </tr>
    <tr>
      <td><code>@Headers(param?: string)</code></td>
      <td>
<code>req.headers</code> / <code>req.headers[param]</code>
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

Акрамя таго, вы можаце ствараць свае ўласныя **дэкаратары** . Чаму гэта карысна?

У свеце node.js звычайная практыка далучаць уласцівасці да аб'екта **запыту** . Затым вы ўручную здабываеце іх у кожным апрацоўшчыку маршрутаў, выкарыстоўваючы наступны код:

```typescript
const user = req.user;
```

Каб зрабіць ваш код больш чытэльным і празрыстым, вы можаце стварыць дэкаратар `@User()` і паўторна выкарыстоўваць яго на ўсіх сваіх кантролерах.

```typescript
@@filename(user.decorator)
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Затым вы можаце проста выкарыстоўваць яго ўсюды, дзе ён адпавядае вашым патрабаванням.

```typescript
@@filename()
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
@@switch
@Get()
@Bind(User())
async findOne(user) {
  console.log(user);
}
```

## Перадача дадзеных

Калі паводзіны вашага дэкаратара залежаць ад некаторых умоў, вы можаце выкарыстоўваць параметр `data` , каб перадаць аргумент фабрычнай функцыі дэкаратара. Адным з варыянтаў выкарыстання гэтага з'яўляецца карыстацкі дэкаратар, які здабывае ўласцівасці з аб'екта запыту па ключы. Давайце, напрыклад, выкажам здагадку, што наш <a href="techniques/authentication#implementing-passport-strategies">ўзровень аўтэнтыфікацыі</a> правярае запыты і далучае сутнасць карыстальніка да аб'екта запыту. Аб'ект карыстальніка для аўтэнтыфікаванага запыту можа выглядаць так:

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

Давайце вызначым дэкаратар, які прымае імя ўласцівасці ў якасці ключа і вяртае адпаведнае значэнне, калі яно існуе (або не вызначана, калі яго не існуе, або калі аб'ект `user` не быў створаны).

```typescript
@@filename(user.decorator)
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
@@switch
import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user && user[data] : user;
});
```

Вось як можна атрымаць доступ да пэўнай уласцівасці праз дэкаратар `@User()` у кантролеры:

```typescript
@@filename()
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
@@switch
@Get()
@Bind(User('firstName'))
async findOne(firstName) {
  console.log(`Hello ${firstName}`);
}
```

Вы можаце выкарыстоўваць гэты ж дэкаратар з рознымі ключамі для доступу да розных уласцівасцяў. Калі `user` аб'ект глыбокі або складаны, гэта можа зрабіць больш простымі і зручнымі для чытання рэалізацыі апрацоўшчыка запытаў.

:::info **Падказка** Для карыстальнікаў TypeScript звярніце ўвагу, што `createParamDecorator<T>()` з'яўляецца агульным. Гэта азначае, што вы можаце відавочна забяспечыць бяспеку тыпу, напрыклад `createParamDecorator<string>((data, ctx) => ...)` . У якасці альтэрнатывы можна задаць тып параметра ў фабрычнай функцыі, напрыклад `createParamDecorator((data: string, ctx) => ...)` . Калі вы прапусціце абодва, тып `data` будзе `any` . :::

## Праца з трубамі

Nest разглядае карыстальніцкія дэкаратары параметраў гэтак жа, як і ўбудаваныя ( `@Body()` , `@Param()` і `@Query()` ). Гэта азначае, што каналы таксама выконваюцца для карыстальніцкіх анатаваных параметраў (у нашых прыкладах, `user` аргумент). Больш за тое, вы можаце прымяніць трубу непасрэдна да ўласнага дэкаратара:

```typescript
@@filename()
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}
@@switch
@Get()
@Bind(User(new ValidationPipe({ validateCustomDecorators: true })))
async findOne(user) {
  console.log(user);
}
```

:::info **Падказка** Звярніце ўвагу, што для параметра `validateCustomDecorators` павінна быць усталявана значэнне true. `ValidationPipe` не правярае аргументы, анатаваныя карыстальніцкімі дэкаратарамі па змаўчанні. :::

## Кампазіцыя дэкаратара

Nest забяспечвае дапаможны метад для стварэння некалькіх дэкаратараў. Напрыклад, выкажам здагадку, што вы хочаце аб'яднаць усе дэкаратары, звязаныя з аўтэнтыфікацыяй, у адзін дэкаратар. Гэта можа быць зроблена з дапамогай наступнай канструкцыі:

```typescript
@@filename(auth.decorator)
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
@@switch
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
```

Затым вы можаце выкарыстоўваць гэты ўласны дэкаратар `@Auth()` наступным чынам:

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

Гэта прывядзе да прымянення ўсіх чатырох дэкаратараў з адной дэкларацыяй.

::: **папярэджанне Папярэджанне** Дэкаратар `@ApiHideProperty()` з пакета `@nestjs/swagger` не паддаецца кампазіцыі і не будзе належным чынам працаваць з функцыяй `applyDecorators` . :::
