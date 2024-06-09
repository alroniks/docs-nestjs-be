# Модулі

Модуль - гэта клас, анатаваны дэкаратарам `@Module()` . Дэкаратар `@Module()` забяспечвае метаданыя, якія **Nest** выкарыстоўвае для арганізацыі структуры прыкладання.

<figure><img src="/assets/Modules_1.png"/></figure>

Кожнае прыкладанне мае як мінімум адзін модуль, **каранёвы модуль** . Каранёвы модуль - гэта адпраўная кропка, якую Nest выкарыстоўвае для пабудовы **графіка прыкладання** - унутраная структура даных, якую Nest выкарыстоўвае для вырашэння адносін і залежнасцей модуля і пастаўшчыка. У той час як вельмі маленькія праграмы тэарэтычна могуць мець толькі каранёвы модуль, гэта не тыповы выпадак. Мы хочам падкрэсліць, што модулі **настойліва** рэкамендуюцца як эфектыўны спосаб арганізацыі кампанентаў. Такім чынам, для большасці прыкладанняў выніковая архітэктура будзе выкарыстоўваць некалькі модуляў, кожны з якіх змяшчае цесна звязаны набор **магчымасцей** .

Дэкаратар `@Module()` прымае адзін аб'ект, уласцівасці якога апісваюць модуль:

|               |                                                                                                                                                                                                                                    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `providers`   | пастаўшчыкі, экзэмпляры якіх будуць створаны інжэктарам Nest і якія могуць быць агульнымі як мінімум для гэтага модуля                                                                                                             |
| `controllers` | набор кантролераў, вызначаных у гэтым модулі, якія павінны быць створаны                                                                                                                                                           |
| `imports`     | спіс імпартаваных модуляў, якія экспартуюць пастаўшчыкоў, неабходных у гэтым модулі                                                                                                                                                |
| `exports`     | падмноства `providers` , якія забяспечваюцца гэтым модулем і павінны быць даступныя ў іншых модулях, якія імпартуюць гэты модуль. Вы можаце выкарыстоўваць альбо самога пастаўшчыка, альбо толькі яго маркер ( `provide` значэнне) |

Модуль **інкапсулюе** пастаўшчыкоў па змаўчанні. Гэта азначае, што немагчыма ўвесці пастаўшчыкоў, якія не з'яўляюцца непасрэдна часткай бягучага модуля і не экспартуюцца з імпартаваных модуляў. Такім чынам, вы можаце лічыць экспартаваныя пастаўшчыкі з модуля публічным інтэрфейсам модуля або API.

## Функцыянальныя модулі

`CatsController` і `CatsService` належаць да аднаго дамена прыкладання. Паколькі яны цесна звязаны, мае сэнс перанесці іх у модуль функцый. Функцыянальны модуль проста арганізуе код, які адпавядае пэўнай функцыі, захоўваючы код у парадку і ўсталёўваючы дакладныя межы. Гэта дапамагае нам кіраваць складанасцю і развівацца па прынцыпах [SOLID](https://en.wikipedia.org/wiki/SOLID) , асабліва па меры росту памеру прыкладання і/або каманды.

Каб прадэманстраваць гэта, мы створым `CatsModule` .

```typescript
@@filename(cats/cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

:::info **Падказка** Каб стварыць модуль з дапамогай CLI, проста выканайце каманду `$ nest g module cats` .
:::

Вышэй мы вызначылі `CatsModule` у файле `cats.module.ts` і перамясцілі ўсё, што звязана з гэтым модулем, у каталог `cats` . Апошняе, што нам трэба зрабіць, гэта імпартаваць гэты модуль у каранёвы модуль ( `AppModule` , вызначаны ў файле `app.module.ts` ).

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

Вось як цяпер выглядае структура нашага каталога:

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
      <div class="item">cats.module.ts</div>
      <div class="item">cats.service.ts</div>
    </div>
    <div class="item">app.module.ts</div>
    <div class="item">асноўны.ц</div>
  </div>
</div>

## Агульныя модулі

У Nest па змаўчанні модулі з'яўляюцца **адзінкавымі** , і таму вы можаце без асаблівых высілкаў абагульваць адзін і той жа асобнік любога пастаўшчыка паміж некалькімі модулямі.

<figure><img src="/assets/Shared_Module_1.png"/></figure>

Кожны модуль аўтаматычна з'яўляецца **агульным модулем** . Пасля стварэння яго можна паўторна выкарыстоўваць любым модулем. Давайце ўявім, што мы хочам абагуліць асобнік `CatsService` паміж некалькімі іншымі модулямі. Каб зрабіць гэта, нам спачатку трэба **экспартаваць** пастаўшчыка `CatsService` , дадаўшы яго ў масіў `exports` модуля, як паказана ніжэй:

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService]
})
export class CatsModule {}
```

Цяпер любы модуль, які імпартуе `CatsModule` мае доступ да `CatsService` і будзе выкарыстоўваць адзін і той жа асобнік з усімі іншымі модулямі, якія таксама яго імпартуюць.

<app-banner-devtools></app-banner-devtools>

## Рээкспарт модуля

Як паказана вышэй, модулі могуць экспартаваць сваіх унутраных пастаўшчыкоў. Акрамя таго, яны могуць рээкспартаваць модулі, якія яны імпартуюць. У прыведзеным ніжэй прыкладзе `CommonModule` імпартуецца ў `CoreModule` **і** экспартуецца з яго, што робіць яго даступным для іншых модуляў, якія імпартуюць гэты.

```typescript
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

## Ін'екцыя залежнасці

Клас модуля можа таксама **ўводзіць** правайдэраў (напрыклад, для мэт канфігурацыі):

```typescript
@@filename(cats.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {
  constructor(private catsService: CatsService) {}
}
@@switch
import { Module, Dependencies } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
@Dependencies(CatsService)
export class CatsModule {
  constructor(catsService) {
    this.catsService = catsService;
  }
}
```

Аднак самі класы модуляў не могуць быць уведзены ў якасці пастаўшчыкоў з-за [цыклічнай залежнасці](/fundamentals/circular-dependency) .

## Глабальныя модулі

Калі вам прыйдзецца паўсюль імпартаваць адзін і той жа набор модуляў, гэта можа стаць стомным. У адрозненне ад Nest, `providers` [Angular](https://angular.dev) зарэгістраваны ў глабальным аб'ёме. Пасля вызначэння яны даступныя ўсюды. Аднак Nest інкапсулюе пастаўшчыкоў у межах модуля. Вы не можаце выкарыстоўваць пастаўшчыкоў модуля ў іншым месцы без папярэдняга імпарту інкапсуляцыйнага модуля.

Калі вы жадаеце забяспечыць набор пастаўшчыкоў, якія павінны быць даступныя паўсюдна з скрынкі (напрыклад, памочнікі, злучэнні з базамі дадзеных і г.д.), зрабіце модуль **глабальным** з дапамогай дэкаратара `@Global()` .

```typescript
import { Module, Global } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

Дэкаратар `@Global()` робіць модуль глабальным. Глабальныя модулі павінны быць зарэгістраваны **толькі адзін раз** , як правіла, з дапамогай каранёвага або асноўнага модуля. У прыведзеным вышэй прыкладзе пастаўшчык `CatsService` будзе паўсюдным, і модулям, якія жадаюць укараніць службу, не трэба будзе імпартаваць `CatsModule` у свой масіў імпарту.

:::info **Падказка** Рабіць усё глабальным - не вельмі добрае дызайнерскае рашэнне. Глабальныя модулі даступныя для памяншэння колькасці неабходных шаблонаў. Масіў `imports` звычайна з'яўляецца пераважным спосабам зрабіць API модуля даступным для спажыўцоў.
:::

## Дынамічныя модулі

Модульная сістэма Nest уключае магутную функцыю пад назвай **дынамічныя модулі** . Гэтая функцыя дазваляе лёгка ствараць наладжвальныя модулі, якія могуць рэгістраваць і дынамічна наладжваць пастаўшчыкоў. Дынамічныя модулі шырока разглядаюцца [тут](/fundamentals/dynamic-modules) . У гэтай главе мы дамо кароткі агляд, каб завяршыць увядзенне ў модулі.

Ніжэй прыведзены прыклад вызначэння дынамічнага модуля для `DatabaseModule` :

```typescript
@@filename()
import { Module, DynamicModule } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
@@switch
import { Module } from '@nestjs/common';
import { createDatabaseProviders } from './database.providers';
import { Connection } from './connection.provider';

@Module({
  providers: [Connection],
  exports: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options) {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

:::info **Падказка** Метад `forRoot()` можа вяртаць дынамічны модуль альбо сінхронна, альбо асінхронна (напрыклад, праз `Promise` ).
:::

Гэты модуль вызначае пастаўшчыка `Connection` па змаўчанні (у метададзеных дэкаратара `@Module()` ), але дадаткова - у залежнасці ад `entities` і `options` , перададзеных у метад `forRoot()` - паказвае калекцыю пастаўшчыкоў, напрыклад, рэпазітары. Звярніце ўвагу, што ўласцівасці, якія вяртае дынамічны модуль, **пашыраюць** (а не адмяняюць) метаданыя базавага модуля, вызначаныя ў дэкаратары `@Module()` . Такім чынам з модуля экспартуюцца як статычна заяўлены пастаўшчык `Connection` **, так і** дынамічна створаныя пастаўшчыкі рэпазітараў.

Калі вы хочаце зарэгістраваць дынамічны модуль у глабальнай вобласці, усталюйце `global` ўласцівасць у `true` .

```typescript
{
  global: true,
  module: DatabaseModule,
  providers: providers,
  exports: providers,
}
```

:::warning **Папярэджанне** Як было сказана вышэй, рабіць усё глабальным **не з'яўляецца добрым дызайнерскім рашэннем** .
:::

`DatabaseModule` можна імпартаваць і наладзіць наступным чынам:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
})
export class AppModule {}
```

Калі вы хочаце ў сваю чаргу рээкспартаваць дынамічны модуль, вы можаце апусціць выклік метаду `forRoot()` у масіве экспарту:

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [DatabaseModule.forRoot([User])],
  exports: [DatabaseModule],
})
export class AppModule {}
```

У раздзеле ["Дынамічныя модулі"](/fundamentals/dynamic-modules) гэтая тэма разглядаецца больш падрабязна і змяшчае [працоўны прыклад](https://github.com/nestjs/nest/tree/master/sample/25-dynamic-modules) .

:::info **Падказка** Даведайцеся, як ствараць наладжвальныя дынамічныя модулі з выкарыстаннем `ConfigurableModuleBuilder` тут, у [гэтай главе](/fundamentals/dynamic-modules#configurable-module-builder) .
:::
