# Правайдэры

Пастаўшчыкі з'яўляюцца фундаментальнай канцэпцыяй у Nest. Многія з асноўных класаў Nest могуць разглядацца як пастаўшчыкі - сэрвісы, сховішчы, фабрыкі, памочнікі і гэтак далей. Асноўная ідэя пастаўшчыка заключаецца ў тым, што ён можа быць **уведзены** ў якасці залежнасці; гэта азначае, што аб'екты могуць ствараць розныя ўзаемаадносіны адзін з адным, а функцыя "падключэння" гэтых аб'ектаў можа быць у значнай ступені дэлегавана сістэме выканання Nest.

<figure><img src="/assets/Components_1.png"></figure>

У папярэдняй главе мы стварылі просты `CatsController` . Кантралёры павінны апрацоўваць запыты HTTP і дэлегаваць больш складаныя задачы **пастаўшчыкам** . Правайдэры - гэта простыя класы JavaScript, якія аб'яўлены як `providers` ў [модулі](/modules) .

:::info **Падказка** Паколькі Nest дае магчымасць распрацоўваць і арганізоўваць залежнасці ў больш аб'ектава-арыентаванай форме, мы настойліва рэкамендуем прытрымлівацца прынцыпаў [SOLID](https://en.wikipedia.org/wiki/SOLID) . :::

## Паслугі

Давайце пачнем са стварэння простага `CatsService` . Гэты сэрвіс будзе адказваць за захоўванне і пошук даных і прызначаны для выкарыстання `CatsController` , таму ён з'яўляецца добрым кандыдатам для вызначэння ў якасці пастаўшчыка.

```typescript
@@filename(cats.service)
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}
```

:::info **Падказка** Каб стварыць службу з дапамогай CLI, проста выканайце каманду `$ nest g service cats` . :::

Наш `CatsService` - гэта базавы клас з адной уласцівасцю і двума метадамі. Адзінай новай функцыяй з'яўляецца выкарыстанне дэкаратара `@Injectable()` . Дэкаратар `@Injectable()` далучае метаданыя, якія дэкларуюць, што `CatsService` з'яўляецца класам, якім можа кіраваць кантэйнер Nest [IoC](https://en.wikipedia.org/wiki/Inversion_of_control) . Дарэчы, у гэтым прыкладзе таксама выкарыстоўваецца інтэрфейс `Cat` , які, верагодна, выглядае прыкладна так:

```typescript
@@filename(interfaces/cat.interface)
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

Цяпер, калі ў нас ёсць сэрвісны клас для атрымання котак, давайце выкарыстаем яго ўнутры `CatsController` :

```typescript
@@filename(cats.controller)
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
@@switch
import { Controller, Get, Post, Body, Bind, Dependencies } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
@Dependencies(CatsService)
export class CatsController {
  constructor(catsService) {
    this.catsService = catsService;
  }

  @Post()
  @Bind(Body())
  async create(createCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }
}
```

`CatsService` **уводзіцца** праз канструктар класа. Звярніце ўвагу на выкарыстанне `private` сінтаксісу. Гэта стэнаграфія дазваляе нам аб'явіць і ініцыялізаваць члена `catsService` адразу ў адным месцы.

## Ін'екцыя залежнасці

Nest пабудаваны вакол моцнага шаблону праектавання, шырока вядомага як **ін'екцыя залежнасці** . Мы рэкамендуем прачытаць выдатны артыкул аб гэтай канцэпцыі ў афіцыйнай дакументацыі [Angular](https://angular.dev/guide/di) .

У Nest, дзякуючы магчымасцям TypeScript, надзвычай лёгка кіраваць залежнасцямі, таму што яны вырашаюцца толькі па тыпу. У прыведзеным ніжэй прыкладзе Nest будзе вырашаць `catsService` , ствараючы і вяртаючы асобнік `CatsService` (або, у звычайным выпадку аднаго элемента, вяртаючы існуючы экземпляр, калі ён ужо быў запытаны ў іншым месцы). Гэтая залежнасць вырашаецца і перадаецца ў канструктар вашага кантролера (або прысвойваецца пазначанай уласцівасці):

```typescript
constructor(private catsService: CatsService) {}
```

## Сферы прыцэла

Пастаўшчыкі звычайна маюць тэрмін службы ("абсяг"), сінхранізаваны з жыццёвым цыклам прыкладання. Калі праграма загружаецца, усе залежнасці павінны быць вырашаны, і таму кожны пастаўшчык павінен быць створаны. Сапраўды гэтак жа, калі праграма зачыняецца, кожны правайдэр будзе знішчаны. Тым не менш, ёсць спосабы зрабіць так, каб ваш пастаўшчык **ахопліваў запыт** на працягу ўсяго жыцця. Вы можаце прачытаць больш аб гэтых метадах [тут](/fundamentals/injection-scopes) .

<app-banner-courses></app-banner-courses>

## Індывідуальныя правайдэры

Nest мае ўбудаваны кантэйнер інверсіі кіравання ("IoC"), які вырашае адносіны паміж пастаўшчыкамі. Гэтая функцыя ляжыць у аснове апісанай вышэй функцыі ўвядзення залежнасцей, але насамрэч значна больш магутная, чым тое, што мы апісвалі да гэтага часу. Ёсць некалькі спосабаў вызначыць пастаўшчыка: вы можаце выкарыстоўваць простыя значэнні, класы і асінхронныя або сінхронныя фабрыкі. Больш прыкладаў прыведзена [тут](/fundamentals/dependency-injection) .

## Дадатковыя пастаўшчыкі

Часам у вас могуць узнікаць залежнасці, якія неабавязкова вырашаць. Напрыклад, ваш клас можа залежаць ад **канфігурацыйнага аб'екта** , але калі ён не перадаецца, трэба выкарыстоўваць значэнні па змаўчанні. У такім выпадку залежнасць становіцца неабавязковай, таму што адсутнасць пастаўшчыка канфігурацыі не прывядзе да памылак.

Каб паказаць, што пастаўшчык неабавязковы, выкарыстоўвайце дэкаратар `@Optional()` у подпісе канструктара.

```typescript
import { Injectable, Optional, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject('HTTP_OPTIONS') private httpClient: T) {}
}
```

Звярніце ўвагу, што ў прыведзеным вышэй прыкладзе мы выкарыстоўваем карыстальніцкага пастаўшчыка, таму мы ўключылі карыстальніцкі **маркер** `HTTP_OPTIONS` . Папярэднія прыклады паказвалі ін'екцыю на аснове канструктара, якая паказвае залежнасць праз клас у канструктары. Даведайцеся больш аб карыстацкіх пастаўшчыкоў і звязаных з імі маркераў [тут](/fundamentals/custom-providers) .

## Ін'екцыя на аснове ўласцівасці

Тэхніка, якую мы выкарыстоўвалі да гэтага часу, называецца ін'екцыяй на аснове канструктара, бо пастаўшчыкі ўкараняюцца з дапамогай метаду канструктара. У некаторых вельмі спецыфічных выпадках **ін'екцыя на аснове ўласцівасці** можа быць карыснай. Напрыклад, калі ваш клас верхняга ўзроўню залежыць ад аднаго або некалькіх пастаўшчыкоў, перадача іх уверх шляхам выкліку `super()` у падкласах з канструктара можа быць вельмі стомнай. Каб пазбегнуць гэтага, вы можаце выкарыстоўваць дэкаратар `@Inject()` на ўзроўні ўласцівасці.

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

:::папярэджанне **Папярэджанне** Калі ваш клас не пашырае іншы клас, вы заўсёды павінны аддаць перавагу выкарыстанню ін'екцыі **на аснове канструктара** . Канструктар выразна вызначае, якія залежнасці патрабуюцца, і забяспечвае лепшую бачнасць, чым атрыбуты класа, пазначаныя `@Inject` . :::

## Рэгістрацыя правайдэра

Цяпер, калі мы вызначылі пастаўшчыка ( `CatsService` ), і ў нас ёсць спажывец гэтай паслугі ( `CatsController` ), нам трэба зарэгістраваць службу ў Nest, каб яна магла выканаць ін'екцыю. Мы робім гэта шляхам рэдагавання нашага файла модуля ( `app.module.ts` ) і дадання службы ў масіў `providers` дэкаратара `@Module()` .

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

Цяпер Nest зможа вырашаць залежнасці класа `CatsController` .

Вось як цяпер павінна выглядаць структура нашага каталога:

<div class="file-tree">
<div class="item">SRC</div>
<div class="children">
<div class="item">кошкі</div>
<div class="children">
<div class="item">dto</div>
<div class="children">
<div class="item">create-cat.dto.ts</div>
</div>
<div class="item">інтэрфейсы</div>
<div class="children">
<div class="item">cat.interface.ts</div>
</div>
<div class="item">cats.controller.ts</div>
<div class="item">cats.service.ts</div>
</div>
<div class="item">app.module.ts</div>
<div class="item">асноўны.ц</div>
</div>
</div>

## Стварэнне асобніка ўручную

Да гэтага часу мы абмяркоўвалі, як Nest аўтаматычна апрацоўвае большасць дэталяў вырашэння залежнасцей. У пэўных абставінах вам можа спатрэбіцца выйсці за межы ўбудаванай сістэмы Dependency Injection і ўручную атрымаць або стварыць асобнік пастаўшчыкоў. Мы коратка абмяркуем дзве такія тэмы ніжэй.

Каб атрымаць існуючыя асобнікі або дынамічна стварыць асобнік пастаўшчыкоў, вы можаце выкарыстоўваць [спасылку на модуль](https://docs.nestjs.com/fundamentals/module-ref) .

Каб атрымаць пастаўшчыкоў у рамках функцыі `bootstrap()` (напрыклад, для аўтаномных прыкладанняў без кантролераў або для выкарыстання службы канфігурацыі падчас загрузкі), глядзіце [аўтаномныя прыкладанні](https://docs.nestjs.com/standalone-applications) .
