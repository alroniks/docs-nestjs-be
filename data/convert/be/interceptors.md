# Перахопнікі

Перахопнік - гэта клас, анатаваны дэкаратарам `@Injectable()` і рэалізуе інтэрфейс `NestInterceptor` .

<figure><img src="/assets/Interceptors_1.png"/></figure>

Перахопнікі маюць набор карысных магчымасцей, якія натхнёны тэхнікай [аспектна-арыентаванага праграмавання](https://en.wikipedia.org/wiki/Aspect-oriented_programming) (AOP). Яны дазваляюць:

- звязаць дадатковую логіку да / пасля выканання метаду
- пераўтварыць вынік, вернуты функцыяй
- ператварыць выключэнне, выкінутае з функцыі
- пашырыць паводзіны асноўных функцый
- цалкам перавызначыць функцыю ў залежнасці ад пэўных умоў (напрыклад, для мэт кэшавання)

## Асновы

Кожны перахопнік рэалізуе метад `intercept()` , які прымае два аргументы. Першы - асобнік `ExecutionContext` (дакладна такі ж аб'ект, што і для [guards](/guards) ). `ExecutionContext` успадкоўваецца ад `ArgumentsHost` . Мы бачылі `ArgumentsHost` раней у раздзеле фільтраў выключэнняў. Там мы ўбачылі, што гэта абалонка вакол аргументаў, якія былі перададзены зыходнаму апрацоўшчыку, і змяшчае розныя масівы аргументаў у залежнасці ад тыпу прыкладання. Вы можаце вярнуцца да [фільтраў выключэнняў,](https://docs.nestjs.com/exception-filters#arguments-host) каб даведацца больш па гэтай тэме.

## Кантэкст выканання

Пашыраючы `ArgumentsHost` , `ExecutionContext` таксама дадае некалькі новых дапаможных метадаў, якія даюць дадатковую інфармацыю аб бягучым працэсе выканання. Гэтыя дэталі могуць быць карыснымі пры стварэнні больш агульных перахопнікаў, якія могуць працаваць з шырокім наборам кантролераў, метадаў і кантэкстаў выканання. Даведайцеся больш пра `ExecutionContext` [тут](/fundamentals/execution-context) .

## Апрацоўшчык выклікаў

Другі аргумент - `CallHandler` . Інтэрфейс `CallHandler` рэалізуе метад `handle()` , які вы можаце выкарыстоўваць для выкліку метаду апрацоўшчыка маршруту ў нейкі момант вашага перахопніка. Калі вы не выклікаеце метад `handle()` у вашай рэалізацыі метаду `intercept()` , метад апрацоўшчыка маршруту не будзе выкананы наогул.

Такі падыход азначае, што метад `intercept()` эфектыўна **абгортвае** паток запыту/адказу. У выніку вы можаце рэалізаваць карыстальніцкую логіку **як да, так і пасля** выканання канчатковага апрацоўшчыка маршруту. Зразумела, што вы можаце напісаць код у метадзе `intercept()` , які выконваецца **перад** выклікам `handle()` , але як вы паўплываеце на тое, што адбудзецца пасля? Паколькі метад `handle()` вяртае `Observable` , мы можам выкарыстоўваць магутныя аператары [RxJS](https://github.com/ReactiveX/rxjs) для далейшага маніпулявання адказам. Выкарыстоўваючы тэрміналогію аспектна-арыентаванага праграмавання, выклік апрацоўшчыка маршруту (напрыклад, выклік `handle()` ) называецца [Pointcut](https://en.wikipedia.org/wiki/Pointcut) , паказваючы, што гэта кропка, у якую ўстаўляецца наша дадатковая логіка.

Разгледзім, напрыклад, уваходны запыт `POST /cats` . Гэты запыт прызначаны для апрацоўшчыка `create()` , вызначанага ўнутры `CatsController` . Калі дзе-небудзь па шляху выклікаецца перахопнік, які не выклікае метад `handle()` , метад `create()` не будзе выкананы. Пасля выкліку `handle()` (і яго `Observable` быў вернуты), апрацоўшчык `create()` будзе запушчаны. І як толькі паток адказу атрыманы праз `Observable` , над патокам можна выканаць дадатковыя аперацыі, і канчатковы вынік будзе вернуты абаненту.

<app-banner-devtools></app-banner-devtools>

## Аспектны перахоп

Першы варыянт выкарыстання, які мы разгледзім, - гэта выкарыстанне перахопніка для рэгістрацыі ўзаемадзеяння з карыстальнікам (напрыклад, захоўвання выклікаў карыстальнікаў, асінхроннай адпраўкі падзей або вылічэння меткі часу). Ніжэй мы паказваем просты `LoggingInterceptor` :

```typescript
@@filename(logging.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor {
  intercept(context, next) {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

:::info **Падказка** `NestInterceptor<T, R>` - гэта агульны інтэрфейс, у якім `T` паказвае тып `Observable<T>` (які падтрымлівае паток адказу), а `R` - тып значэння, абгорнутага `Observable<R>` . :::

:::папярэджанне Перахопнікі **апавяшчэнняў** , такія як кантролеры, правайдэры, ахоўнікі і гэтак далей, могуць **уводзіць залежнасці** праз свой `constructor` . :::

Паколькі `handle()` вяртае RxJS `Observable` , у нас ёсць шырокі выбар аператараў, якія мы можам выкарыстоўваць для маніпулявання патокам. У прыведзеным вышэй прыкладзе мы выкарысталі аператар `tap()` , які выклікае нашу ананімную функцыю вядзення часопіса пасля лагоднага або выключнага завяршэння назіранага патоку, але ў іншым выпадку не перашкаджае цыклу адказу.

## Перахопнікі прывязкі

Каб наладзіць перахопнік, мы выкарыстоўваем дэкаратар `@UseInterceptors()` , імпартаваны з пакета `@nestjs/common` . Як [трубы](/pipes) і [ахоўнікі](/guards) , перахопнікі могуць быць з вобласцю кантролера, метаду або глабальнай вобласцю.

```typescript
@@filename(cats.controller)
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

:::info **Падказка** Дэкаратар `@UseInterceptors()` імпартаваны з пакета `@nestjs/common` . :::

З дапамогай прыведзенай вышэй канструкцыі кожны апрацоўшчык маршрутаў, вызначаны ў `CatsController` будзе выкарыстоўваць `LoggingInterceptor` . Калі нехта выклікае канчатковую кропку `GET /cats` , вы ўбачыце наступны вывад у вашым стандартным вывадзе:

```typescript
Before...
After... 1ms
```

Звярніце ўвагу, што мы перадалі клас `LoggingInterceptor` (замест асобніка), пакінуўшы адказнасць за стварэнне асобніка фрэймворку і дазволіўшы ін'екцыю залежнасці. Як і ў выпадку з каналамі, ахоўнікамі і фільтрамі выключэнняў, мы таксама можам перадаць асобнік на месцы:

```typescript
@@filename(cats.controller)
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```

Як ужо згадвалася, канструкцыя вышэй далучае перахопнік да кожнага апрацоўшчыка, аб'яўленага гэтым кантролерам. Калі мы хочам абмежаваць вобласць дзеяння перахопніка адным метадам, мы проста ўжываем дэкаратар на **ўзроўні метаду** .

Каб наладзіць глабальны перахопнік, мы выкарыстоўваем метад `useGlobalInterceptors()` асобніка прыкладання Nest:

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

Глабальныя перахопнікі выкарыстоўваюцца ва ўсім дадатку, для кожнага кантролера і кожнага апрацоўшчыка маршрутаў. З пункту гледжання ўвядзення залежнасцей, глабальныя перахопнікі, зарэгістраваныя па-за межамі любога модуля (з дапамогай `useGlobalInterceptors()` , як у прыкладзе вышэй), не могуць уводзіць залежнасці, паколькі гэта робіцца па-за кантэкстам любога модуля. Каб вырашыць гэтую праблему, вы можаце наладзіць перахопнік **непасрэдна з любога модуля,** выкарыстоўваючы наступную канструкцыю:

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

:::info **Падказка** Пры выкарыстанні гэтага падыходу для выканання ін'екцыі залежнасці для перахопніка звярніце ўвагу, што незалежна ад :::

> Модуль, дзе выкарыстоўваецца гэтая канструкцыя, перахопнік, па сутнасці, з'яўляецца глабальным. Дзе гэта рабіць? Выберыце модуль, дзе вызначаны перахопнік ( `LoggingInterceptor` у прыкладзе вышэй). Акрамя таго, `useClass` - не адзіны спосаб мець справу з карыстацкай рэгістрацыяй пастаўшчыка. Даведайцеся больш [тут](/fundamentals/custom-providers) .

## Адлюстраванне адказу

Мы ўжо ведаем, што `handle()` вяртае `Observable` . Паток змяшчае значэнне **, вернутае** апрацоўшчыкам маршруту, і таму мы можам лёгка змяніць яго з дапамогай аператара `map()` RxJS.

:::папярэджанне **Папярэджанне** Функцыя адлюстравання адказу не працуе са стратэгіяй адказу для канкрэтнай бібліятэкі (непасрэднае выкарыстанне аб'екта `@Res()` забаронена). :::

Давайце створым `TransformInterceptor` , які будзе змяняць кожны адказ трывіяльным спосабам, каб прадэманстраваць працэс. Ён будзе выкарыстоўваць аператар `map()` RxJS, каб прызначыць аб'ект адказу ўласцівасці `data` новастворанага аб'екта, вяртаючы новы аб'ект кліенту.

```typescript
@@filename(transform.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor {
  intercept(context, next) {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

:::info **Hint** Перахопнікі Nest працуюць як з сінхроннымі, так і з асінхроннымі метадамі `intercept()` . Пры неабходнасці вы можаце проста пераключыць метад на `async` . :::

Пры прыведзенай вышэй канструкцыі, калі нехта выклікае канчатковую кропку `GET /cats` , адказ будзе выглядаць наступным чынам (пры ўмове, што апрацоўшчык маршруту вяртае пусты масіў `[]` ):

```json
{
  "data": []
}
```

Перахопнікі маюць вялікае значэнне ў стварэнні шматразовых рашэнняў для патрабаванняў, якія ўзнікаюць ва ўсім дадатку. Напрыклад, уявіце, што нам трэба пераўтварыць кожнае ўваходжанне `null` значэння ў пусты радок `''` . Мы можам зрабіць гэта з дапамогай аднаго радка кода і прывязаць перахопнік глабальна, каб ён аўтаматычна выкарыстоўваўся кожным зарэгістраваным апрацоўшчыкам.

```typescript
@@filename()
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor {
  intercept(context, next) {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
```

## Адлюстраванне выключэнняў

Яшчэ адзін цікавы варыянт выкарыстання - скарыстацца перавагамі аператара `catchError()` RxJS для перавызначэння кінутых выключэнняў:

```typescript
@@filename(errors.interceptor)
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => new BadGatewayException())),
      );
  }
}
@@switch
import { Injectable, BadGatewayException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor {
  intercept(context, next) {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => new BadGatewayException())),
      );
  }
}
```

## Перавызначэнне плыні

Ёсць некалькі прычын, па якіх часам мы можам захацець цалкам прадухіліць выклік апрацоўшчыка і замест гэтага вяртаць іншае значэнне. Відавочным прыкладам з'яўляецца ўкараненне кэша для паляпшэння часу водгуку. Давайце паглядзім на просты **перахопнік кэша** , які вяртае адказ з кэша. У рэалістычным прыкладзе мы хацелі б улічыць іншыя фактары, такія як TTL, несапраўднасць кэша, памер кэша і г.д., але гэта выходзіць за рамкі гэтага абмеркавання. Тут мы прывядзем асноўны прыклад, які дэманструе асноўную канцэпцыю.

```typescript
@@filename(cache.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
@@switch
import { Injectable } from '@nestjs/common';
import { of } from 'rxjs';

@Injectable()
export class CacheInterceptor {
  intercept(context, next) {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
```

Наш `CacheInterceptor` мае жорстка закадаваную зменную `isCached` і жорстка закодаваны адказ `[]` . Ключавы момант, на які варта звярнуць увагу, заключаецца ў тым, што мы вяртаем тут новы паток, створаны аператарам RxJS `of()` , таму апрацоўшчык маршруту **не будзе выклікацца** наогул. Калі нехта выклікае канечную кропку, якая выкарыстоўвае `CacheInterceptor` , адказ (жорстка закадзіраваны пусты масіў) будзе неадкладна вернуты. Каб стварыць агульнае рашэнне, вы можаце скарыстацца `Reflector` і стварыць уласны дэкаратар. `Reflector` добра апісаны ў раздзеле [аб ахоўніках](/guards) .

## Больш аператараў

Магчымасць маніпулявання патокам з дапамогай аператараў RxJS дае нам шмат магчымасцей. Давайце разгледзім яшчэ адзін распаўсюджаны выпадак выкарыстання. Уявіце, што вы хацелі б апрацоўваць **тайм-аўты** на запыты маршруту. Калі ваша канчатковая кропка нічога не вяртае праз некаторы перыяд часу, вы хочаце спыніць працу з паведамленнем пра памылку. Наступная канструкцыя дазваляе гэта:

```typescript
@@filename(timeout.interceptor)
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
@@switch
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
```

Праз 5 секунд апрацоўка запыту будзе адменена. Вы таксама можаце дадаць нестандартную логіку, перш чым кідаць `RequestTimeoutException` (напрыклад, вызваліць рэсурсы).
