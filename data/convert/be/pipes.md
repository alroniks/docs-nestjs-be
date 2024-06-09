# Трубы

Канал - гэта клас, анатаваны дэкаратарам `@Injectable()` , які рэалізуе інтэрфейс `PipeTransform` .

<figure>   <img src="/assets/Pipe_1.png"> </figure>

Трубы маюць два тыповых выпадку выкарыстання:

- **пераўтварэнне** : пераўтварэнне ўваходных дадзеных у жаданую форму (напрыклад, з радка ў цэлы лік)
- **праверка** : ацэнка ўваходных даных і, калі яны сапраўдныя, проста прапускае іх без зменаў; у адваротным выпадку, скінуць выключэнне

У абодвух выпадках каналы працуюць з `arguments` , якія апрацоўваюцца <a href="controllers#route-parameters">апрацоўшчыкам маршруту кантролера</a> . Nest устаўляе канал непасрэдна перад выклікам метаду, і канал атрымлівае аргументы, прызначаныя для метаду, і працуе з імі. Любая аперацыя пераўтварэння або праверкі адбываецца ў гэты час, пасля чаго апрацоўшчык маршруту выклікаецца з любымі (патэнцыйна) пераўтворанымі аргументамі.

Nest пастаўляецца з некалькімі ўбудаванымі трубкамі, якімі можна карыстацца адразу. Вы таксама можаце стварыць свае ўласныя трубы. У гэтай главе мы прадставім убудаваныя каналы і пакажам, як прывязаць іх да апрацоўшчыкаў маршрутаў. Затым мы разгледзім некалькі труб, зробленых на заказ, каб паказаць, як можна пабудаваць трубы з нуля.

:::info **Падказка** Трубы праходзяць у зоне выключэнняў. Гэта азначае, што калі Pipe стварае выключэнне, яно апрацоўваецца ўзроўнем выключэнняў (глабальны фільтр выключэнняў і любыя [фільтры выключэнняў](/exception-filters) , якія прымяняюцца да бягучага кантэксту). Улічваючы вышэйсказанае, павінна быць ясна, што калі ў канале ствараецца выключэнне, метад кантролера пасля не выконваецца. Гэта дае вам найлепшую тэхніку для праверкі даных, якія паступаюць у прыкладанне з знешніх крыніц на мяжы сістэмы. :::

## Убудаваныя трубы

Nest пастаўляецца з дзевяццю трубамі, даступнымі са скрынкі:

- `ValidationPipe`
- `ParseIntPipe`
- `ParseFloatPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`
- `ParseEnumPipe`
- `DefaultValuePipe`
- `ParseFilePipe`

Яны экспартуюцца з пакета `@nestjs/common` .

Давайце коратка разгледзім выкарыстанне `ParseIntPipe` . Гэта прыклад выкарыстання **пераўтварэння** , калі канвеер забяспечвае пераўтварэнне параметра апрацоўшчыка метаду ў цэлае лік JavaScript (або стварае выключэнне, калі пераўтварэнне не ўдаецца). Далей у гэтай главе мы пакажам простую карыстацкую рэалізацыю для `ParseIntPipe` . Прыведзеныя ніжэй прыклады метадаў таксама прымяняюцца да іншых убудаваных каналаў трансфармацыі ( `ParseBoolPipe` , `ParseFloatPipe` , `ParseEnumPipe` , `ParseArrayPipe` і `ParseUUIDPipe` , якія мы будзем называць каналамі `Parse*` у гэтай главе).

## Абвязка труб

Каб выкарыстоўваць канал, нам трэба прывязаць асобнік класа канала да адпаведнага кантэксту. У нашым прыкладзе `ParseIntPipe` мы хочам звязаць канал з пэўным метадам апрацоўшчыка маршруту і пераканацца, што ён запускаецца перад выклікам метаду. Мы робім гэта з дапамогай наступнай канструкцыі, якую мы будзем называць прывязкай канала на ўзроўні параметраў метаду:

```typescript
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

Гэта гарантуе выкананне адной з наступных дзвюх умоў: альбо параметр, які мы атрымліваем у метадзе `findOne()` з'яўляецца лікам (як чакаецца ў нашым выкліку `this.catsService.findOne()` ), альбо выключэнне ствараецца перад маршрутам апрацоўшчык называецца.

Напрыклад, выкажам здагадку, што маршрут называецца так:

```bash
GET localhost:3000/abc
```

Nest выкліча наступнае выключэнне:

```json
{
  "statusCode": 400,
  "message": "Validation failed (numeric string is expected)",
  "error": "Bad Request"
}
```

Выключэнне прадухіліць выкананне цела метаду `findOne()` .

У прыведзеным вышэй прыкладзе мы перадаем клас ( `ParseIntPipe` ), а не асобнік, пакідаючы адказнасць за стварэнне асобніка фрэймворку і дазваляючы ўкараненне залежнасці. Як і ў выпадку з трубамі і ахоўнікамі, замест гэтага мы можам перадаць асобнік на месцы. Перадача экзэмпляра на месцы карысная, калі мы хочам наладзіць паводзіны ўбудаванага канала шляхам перадачы параметраў:

```typescript
@Get(':id')
async findOne(
  @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
  id: number,
) {
  return this.catsService.findOne(id);
}
```

Прывязка іншых каналаў трансфармацыі (усіх каналаў **Parse*** ) працуе аналагічна. Усе гэтыя каналы працуюць у кантэксце праверкі параметраў маршруту, параметраў радка запыту і значэнняў цела запыту.

Напрыклад, з параметрам радка запыту:

```typescript
@Get()
async findOne(@Query('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

Вось прыклад выкарыстання `ParseUUIDPipe` для аналізу параметра радка і праверкі, ці з'яўляецца ён UUID.

```typescript
@@filename()
@Get(':uuid')
async findOne(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
  return this.catsService.findOne(uuid);
}
@@switch
@Get(':uuid')
@Bind(Param('uuid', new ParseUUIDPipe()))
async findOne(uuid) {
  return this.catsService.findOne(uuid);
}
```

:::info **Падказка** Пры выкарыстанні `ParseUUIDPipe()` вы разбіраеце UUID у версіі 3, 4 або 5, калі вам патрабуецца толькі пэўная версія UUID, вы можаце перадаць версію ў параметрах канала. :::

Вышэй мы бачылі прыклады прывязкі розных сямействаў убудаваных каналаў `Parse*` . Прывязка каналаў праверкі крыху іншая; мы абмяркуем гэта ў наступным раздзеле.

:::info **Падказка** Таксама глядзіце [метады праверкі](/techniques/validation) для шырокіх прыкладаў каналаў праверкі. :::

## Нестандартныя трубы

Як ужо згадвалася, вы можаце стварыць свае ўласныя трубы. У той час як Nest забяспечвае надзейныя ўбудаваныя `ParseIntPipe` і `ValidationPipe` , давайце створым простыя карыстальніцкія версіі кожнага з нуля, каб убачыць, як ствараюцца карыстальніцкія каналы.

Мы пачынаем з простага `ValidationPipe` . Першапачаткова мы проста прымаем уваходнае значэнне і неадкладна вяртаем тое ж значэнне, паводзячы сябе як функцыя ідэнтыфікацыі.

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationPipe {
  transform(value, metadata) {
    return value;
  }
}
```

:::info **Падказка** `PipeTransform<T, R>` - гэта агульны інтэрфейс, які павінен быць рэалізаваны любым каналам. Агульны інтэрфейс выкарыстоўвае `T` , каб паказаць тып уваходнага `value` , і `R` , каб паказаць тып вяртання метаду `transform()` . :::

Кожны канал павінен рэалізаваць метад `transform()` , каб выканаць кантракт інтэрфейсу `PipeTransform` . Гэты метад мае два параметры:

- `value`
- `metadata`

Параметр `value` - гэта аргумент метаду, які апрацоўваецца ў дадзены момант (да яго атрымання метадам апрацоўкі маршруту), а `metadata` - гэта метаданыя аргумента метаду, які апрацоўваецца ў цяперашні час. Аб'ект метададзеных мае наступныя ўласцівасці:

```typescript
export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}
```

Гэтыя ўласцівасці апісваюць аргумент, які зараз апрацоўваецца.

<table>
  <tr>
    <td>
      <code>type</code>
    </td>
    <td>Паказвае, ці з'яўляецца аргумент целам <code>@Body()</code> , запытам <code>@Query()</code> , параметрам <code>@Param()</code> або карыстальніцкім параметрам (больш падрабязна <a routerlink="/custom-decorators">тут</a> ).</td>
  </tr>
  <tr>
    <td>
      <code>metatype</code>
    </td>
    <td>       Дае метатып аргумента, напрыклад, <code>String</code> . Заўвага: значэнне <code>undefined</code> , калі вы прапусціце дэкларацыю тыпу ў сігнатуры метаду апрацоўшчыка маршруту або выкарыстоўваеце банальны JavaScript.     </td>
  </tr>
  <tr>
    <td>
      <code>data</code>
    </td>
    <td>Радок, перададзены дэкаратару, напрыклад <code>@Body('string')</code> . Гэта <code>undefined</code> , калі вы пакінеце круглыя ​​дужкі дэкаратара пустымі.</td>
  </tr>
</table>

:::папярэджанне **Папярэджанне** Інтэрфейсы TypeScript знікаюць падчас транспіляцыі. Такім чынам, калі тып параметра метаду аб'яўлены як інтэрфейс замест класа, значэннем `metatype` будзе `Object` . :::

## Праверка на аснове схемы

Давайце зробім наш канал праверкі крыху больш карысным. Паглядзіце больш уважліва на метад `create()` `CatsController` , дзе мы, верагодна, хацелі б пераканацца, што аб'ект цела паведамлення сапраўдны, перш чым спрабаваць запусціць наш сэрвісны метад.

```typescript
@@filename()
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
async create(@Body() createCatDto) {
  this.catsService.create(createCatDto);
}
```

Давайце засяродзімся на параметры цела `createCatDto` . Яго тып `CreateCatDto` :

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

Мы хочам пераканацца, што любы ўваходны запыт да метаду create змяшчае сапраўднае цела. Такім чынам, мы павінны праверыць тры ўдзельніка аб'екта `createCatDto` . Мы маглі б зрабіць гэта ўнутры метаду апрацоўшчыка маршрутаў, але гэта не ідэальна, бо гэта парушыць **прынцып адзінай адказнасці** (SRP).

Іншым падыходам можа быць стварэнне **класа валідатара** і дэлегаванне задачы туды. Гэта мае той недахоп, што мы павінны памятаць пра выклік гэтага валідатара ў пачатку кожнага метаду.

Як наконт стварэння прамежкавага праграмнага забеспячэння для праверкі? Гэта можа спрацаваць, але, на жаль, немагчыма стварыць **агульнае прамежкавае праграмнае забеспячэнне** , якое можа выкарыстоўвацца ва ўсіх кантэкстах ва ўсім дадатку. Гэта таму, што прамежкавае праграмнае забеспячэнне не ведае пра **кантэкст выканання** , уключаючы апрацоўшчык, які будзе выкліканы, і любыя яго параметры.

Гэта, вядома, менавіта той выпадак выкарыстання, для якога распрацаваны трубы. Такім чынам, давайце ўдасканалім наш канал праверкі.

<app-banner-courses></app-banner-courses>

## Праверка схемы аб'екта

Ёсць некалькі даступных падыходаў для праверкі аб'екта чыстым, [СУХІМ](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) спосабам. Адным з распаўсюджаных падыходаў з'яўляецца выкарыстанне праверкі **на аснове схемы** . Давайце паспрабуем гэты падыход.

Бібліятэка [Zod](https://zod.dev/) дазваляе вам ствараць схемы простым спосабам з даступным API. Давайце пабудуем канал праверкі, які выкарыстоўвае схемы на аснове Zod.

Пачніце з устаноўкі неабходнага пакета:

```bash
$ npm install --save zod
```

У прыкладзе кода ніжэй мы ствараем просты клас, які прымае схему ў якасці аргумента `constructor` . Затым мы прымяняем метад `schema.parse()` , які правярае наш уваходны аргумент адносна прадстаўленай схемы.

Як адзначалася раней, **канал праверкі** альбо вяртае значэнне без зменаў, альбо стварае выключэнне.

У наступным раздзеле вы ўбачыце, як мы пастаўляем адпаведную схему для дадзенага метаду кантролера з дапамогай дэкаратара `@UsePipes()` . Гэта робіць наш канал праверкі шматразовым у розных кантэкстах, як мы і планавалі зрабіць.

```typescript
@@filename()
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema  } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}
@@switch
import { BadRequestException } from '@nestjs/common';

export class ZodValidationPipe {
  constructor(private schema) {}

  transform(value, metadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}

```

## Звязванне праверкі труб

Раней мы бачылі, як звязваць каналы трансфармацыі (напрыклад, `ParseIntPipe` і астатнія каналы `Parse*` ).

Прывязка каналаў праверкі таксама вельмі простая.

У гэтым выпадку мы хочам звязаць канал на ўзроўні выкліку метаду. У нашым бягучым прыкладзе нам трэба зрабіць наступнае, каб выкарыстоўваць `ZodValidationPipe` :

1. Стварыце асобнік `ZodValidationPipe`
2. Перадайце кантэкстна-спецыфічную схему Zod у канструктар класа канала
3. Прывязаць трубу да метаду

Прыклад схемы Zod:

```typescript
import { z } from 'zod';

export const createCatSchema = z
  .object({
    name: z.string(),
    age: z.number(),
    breed: z.string(),
  })
  .required();

export type CreateCatDto = z.infer<typeof createCatSchema>;
```

Мы робім гэта з дапамогай дэкаратара `@UsePipes()` як паказана ніжэй:

```typescript
@@filename(cats.controller)
@Post()
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Bind(Body())
@UsePipes(new ZodValidationPipe(createCatSchema))
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

:::info **Падказка** Дэкаратар `@UsePipes()` імпартаваны з пакета `@nestjs/common` . :::

:::папярэджанне **Папярэджанне** бібліятэкі `zod` патрабуе ўключэння канфігурацыі `strictNullChecks` у вашым файле `tsconfig.json` . :::

## Валідатар класаў

:::папярэджанне **Папярэджанне** Метады ў гэтым раздзеле патрабуюць TypeScript і недаступныя, калі ваша праграма напісана з дапамогай банальнага JavaScript. :::

Давайце паглядзім на альтэрнатыўную рэалізацыю нашай методыкі праверкі.

Nest добра працуе з бібліятэкай [праверкі класаў](https://github.com/typestack/class-validator) . Гэтая магутная бібліятэка дазваляе выкарыстоўваць праверку на аснове дэкаратара. Праверка на аснове дэкаратара надзвычай магутная, асабліва ў спалучэнні з магчымасцямі Nest's **Pipe** , паколькі мы маем доступ да `metatype` апрацаванай уласнасці. Перш чым пачаць, нам трэба ўсталяваць неабходныя пакеты:

```bash
$ npm i --save class-validator class-transformer
```

Пасля таго, як яны ўстаноўлены, мы можам дадаць некалькі дэкаратараў у клас `CreateCatDto` . Тут мы бачым значную перавагу гэтага метаду: клас `CreateCatDto` застаецца адзінай крыніцай ісціны для нашага аб'екта Post body (замест таго, каб ствараць асобны клас праверкі).

```typescript
@@filename(create-cat.dto)
import { IsString, IsInt } from 'class-validator';

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

:::info **Падказка** Даведайцеся больш пра дэкаратары класа-валідатара [тут](https://github.com/typestack/class-validator#usage) . :::

Цяпер мы можам стварыць клас `ValidationPipe` , які выкарыстоўвае гэтыя анатацыі.

```typescript
@@filename(validation.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

:::info **Падказка** Нагадваем, што вам неабавязкова ствараць агульны канал праверкі самастойна, паколькі `ValidationPipe` прадастаўляецца Nest гатовым. Убудаваны `ValidationPipe` прапануе больш варыянтаў, чым узор, які мы пабудавалі ў гэтай главе, які застаўся базавым дзеля ілюстрацыі механікі трубы, пабудаванай на заказ. Вы можаце знайсці поўную інфармацыю, а таксама мноства прыкладаў [тут](/techniques/validation) . :::

:::папярэджанне **Заўвага.** Мы выкарысталі бібліятэку [класаў-трансфарматараў](https://github.com/typestack/class-transformer) , якая створана тым жа аўтарам, што і бібліятэка **валідатараў класаў** , і ў выніку яны вельмі добра працуюць разам. :::

Давайце разгледзім гэты код. Па-першае, звярніце ўвагу, што метад `transform()` пазначаны як `async` . Гэта магчыма таму, што Nest падтрымлівае як сінхронныя, так і **асінхронныя** каналы. Мы робім гэты метад `async` таму што некаторыя праверкі класа-валідатара [могуць быць асінхроннымі](https://github.com/typestack/class-validator#custom-validation-classes) (выкарыстоўваць Promises).

Далей звярніце ўвагу, што мы выкарыстоўваем дэструктурызацыю, каб выняць поле метатыпу (выцягваючы толькі гэты член з `ArgumentMetadata` ) у наш параметр `metatype` . Гэта проста скарачэнне для атрымання поўнага `ArgumentMetadata` і дадатковага аператара для прызначэння зменнай метатыпу.

Далей звярніце ўвагу на дапаможную функцыю `toValidate()` . Ён адказвае за абыход этапу праверкі, калі бягучы аргумент, які апрацоўваецца, з'яўляецца ўласным тыпам JavaScript (яны не могуць мець дэкаратары праверкі, таму няма прычын запускаць іх праз этап праверкі).

Далей мы выкарыстоўваем функцыю пераўтваральніка класа `plainToInstance()` , каб пераўтварыць наш просты аб'ект аргумента JavaScript у тыпізаваны аб'ект, каб мы маглі прымяніць праверку. Прычына, па якой мы павінны зрабіць гэта, заключаецца ў тым, што аб'ект цела ўваходнага паведамлення, калі ён дэсерыялізаваны з сеткавага запыту, **не мае ніякай інфармацыі аб тыпе** (так працуе асноўная платформа, напрыклад Express). Class-validator павінен выкарыстоўваць дэкаратары праверкі, якія мы вызначылі для нашага DTO раней, таму нам трэба выканаць гэтае пераўтварэнне, каб разглядаць уваходнае цела як адпаведна аформлены аб'ект, а не проста звычайны аб'ект.

Нарэшце, як адзначалася раней, паколькі гэта **канал праверкі** , ён альбо вяртае значэнне без зменаў, альбо стварае выключэнне.

Апошні крок - прывязка `ValidationPipe` . Трубы могуць быць з вобласцю параметраў, метадаў, кантролераў або глабальных. Раней, з нашым каналам праверкі на аснове Zod, мы бачылі прыклад прывязкі канала на ўзроўні метаду. У прыведзеным ніжэй прыкладзе мы звяжам асобнік канала з дэкаратарам апрацоўшчыка маршруту `@Body()` , каб наш канал выклікаўся для праверкі цела паведамлення.

```typescript
@@filename(cats.controller)
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

Каналы з ахопам параметраў карысныя, калі логіка праверкі тычыцца толькі аднаго вызначанага параметра.

## Глабальныя трубы

Паколькі `ValidationPipe` быў створаны як мага больш агульны, мы можам рэалізаваць яго поўную карыснасць, наладзіўшы яго як **глабальны** канал, каб ён прымяняўся да кожнага апрацоўшчыка маршрутаў ва ўсім дадатку.

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

:::warning **Заўвага.** У выпадку <a href="faq/hybrid-application">гібрыдных праграм</a> метад `useGlobalPipes()` не наладжвае каналы для шлюзаў і мікрасэрвісаў. Для «стандартных» (негібрыдных) мікрасэрвісных праграм `useGlobalPipes()` мантуе каналы глабальна. :::

Глабальныя каналы выкарыстоўваюцца ва ўсім дадатку, для кожнага кантролера і кожнага апрацоўшчыка маршрутаў.

Звярніце ўвагу, што з пункту гледжання ўкаранення залежнасцей, глабальныя каналы, зарэгістраваныя па-за межамі любога модуля (з дапамогай `useGlobalPipes()` як у прыкладзе вышэй), не могуць уводзіць залежнасці, паколькі прывязка была выканана па-за кантэкстам любога модуля. Каб вырашыць гэтую праблему, вы можаце наладзіць глабальны канал **непасрэдна з любога модуля,** выкарыстоўваючы наступную канструкцыю:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
```

:::info **Падказка** Пры выкарыстанні гэтага падыходу для выканання ін'екцыі залежнасцей для канвеера звярніце ўвагу, што незалежна ад модуля, у якім выкарыстоўваецца гэтая канструкцыя, канвеер, па сутнасці, з'яўляецца глабальным. Дзе гэта рабіць? Выберыце модуль, у якім вызначаны канал ( `ValidationPipe` у прыкладзе вышэй). Акрамя таго, `useClass` - не адзіны спосаб мець справу з карыстацкай рэгістрацыяй пастаўшчыка. Даведайцеся больш [тут](/fundamentals/custom-providers) . :::

## Убудаваны ValidationPipe

Нагадваем, што вам неабавязкова ствараць агульны канал праверкі самастойна, паколькі `ValidationPipe` прадастаўляецца Nest гатовым да выкарыстання. Убудаваны `ValidationPipe` прапануе больш варыянтаў, чым узор, які мы пабудавалі ў гэтай главе, які застаўся базавым дзеля ілюстрацыі механікі трубы, пабудаванай на заказ. Вы можаце знайсці поўную інфармацыю, а таксама мноства прыкладаў [тут](/techniques/validation) .

## Варыянт выкарыстання трансфармацыі

Праверка - не адзіны выпадак выкарыстання карыстацкіх каналаў. У пачатку гэтай главы мы згадвалі, што канвеер таксама можа **трансфармаваць** ўваходныя даныя ў патрэбны фармат. Гэта магчыма таму, што значэнне, якое вяртаецца з функцыі `transform` цалкам перакрывае папярэдняе значэнне аргумента.

Калі гэта карысна? Улічыце, што часам дадзеныя, якія перадаюцца ад кліента, павінны прайсці некаторыя змены - напрыклад, пераўтварэнне радка ў цэлы лік - перш чым яны могуць быць правільна апрацаваны метадам апрацоўшчыка маршрутаў. Акрамя таго, некаторыя абавязковыя палі даных могуць адсутнічаць, і мы хацелі б прымяніць значэнні па змаўчанні. **Канале трансфармацыі** можа выконваць гэтыя функцыі, устаўляючы функцыю апрацоўкі паміж кліенцкім запытам і апрацоўшчыкам запытаў.

Вось просты `ParseIntPipe` , які адказвае за разбор радка ў цэлае значэнне. (Як адзначалася вышэй, у Nest ёсць убудаваны `ParseIntPipe` , які з'яўляецца больш складаным; мы ўключаем гэта ў якасці простага прыкладу карыстальніцкага канала трансфармацыі).

```typescript
@@filename(parse-int.pipe)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
@@switch
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntPipe {
  transform(value, metadata) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}
```

Затым мы можам звязаць гэты канал з абраным параметрам, як паказана ніжэй:

```typescript
@@filename()
@Get(':id')
async findOne(@Param('id', new ParseIntPipe()) id) {
  return this.catsService.findOne(id);
}
@@switch
@Get(':id')
@Bind(Param('id', new ParseIntPipe()))
async findOne(id) {
  return this.catsService.findOne(id);
}
```

Іншым карысным выпадкам пераўтварэння можа быць выбар **існуючага карыстальніцкага** аб'екта з базы дадзеных з выкарыстаннем ідэнтыфікатара, указанага ў запыце:

```typescript
@@filename()
@Get(':id')
findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
  return userEntity;
}
@@switch
@Get(':id')
@Bind(Param('id', UserByIdPipe))
findOne(userEntity) {
  return userEntity;
}
```

Мы пакідаем рэалізацыю гэтага канала чытачу, але звярніце ўвагу, што, як і ўсе іншыя каналы трансфармацыі, ён атрымлівае ўваходнае значэнне ( `id` ) і вяртае выходнае значэнне (аб'ект `UserEntity` ). Гэта можа зрабіць ваш код больш дэкларатыўным і [СУХІМ,](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) абстрагуючы шаблонны код з вашага апрацоўшчыка ў агульны канал.

## Прадастаўленне значэнняў па змаўчанні

`Parse*` каналаў чакае, што значэнне параметра будзе вызначана. Яны ствараюць выключэнне пры атрыманні `null` або `undefined` значэнняў. Каб дазволіць канчатковай кропцы апрацоўваць адсутныя значэнні параметраў радка запыту, мы павінны забяспечыць значэнне па змаўчанні, якое будзе ўведзена перад тым, як каналы `Parse*` будуць працаваць з гэтымі значэннямі. `DefaultValuePipe` служыць гэтай мэты. Проста стварыце асобнік `DefaultValuePipe` у дэкаратары `@Query()` перад адпаведным каналам `Parse*` , як паказана ніжэй:

```typescript
@@filename()
@Get()
async findAll(
  @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
) {
  return this.catsService.findAll({ activeOnly, page });
}
```
