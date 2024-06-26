# Кіраўніцтва па міграцыі

У гэтым артыкуле прадстаўлены набор рэкамендацый па пераходзе з Nest версіі 9 на версію 10. Каб даведацца больш пра новыя функцыі, якія мы дадалі ў v10, азнаёмцеся з гэтым [артыкулам](https://trilon.io/blog/nestjs-10-is-now-available) . Былі некаторыя вельмі нязначныя непрыемныя змены, якія не павінны паўплываць на большасць карыстальнікаў - вы можаце знайсці іх поўны спіс [тут](https://github.com/nestjs/nest/releases/tag/v10.0.0) .

## Абнаўленне пакетаў

Хаця вы можаце абнавіць свае пакеты ўручную, мы рэкамендуем выкарыстоўваць [ncu (npm праверыць абнаўленні)](https://npmjs.com/package/npm-check-updates) .

## Модуль кэша

`CacheModule` быў выдалены з пакета `@nestjs/common` і цяпер даступны як асобны пакет - `@nestjs/cache-manager` . Гэта змяненне было зроблена, каб пазбегнуць непатрэбных залежнасцей у пакеце `@nestjs/common` . Вы можаце даведацца больш пра пакет `@nestjs/cache-manager` [тут](https://docs.nestjs.com/techniques/caching) .

## Дэпрэкацыі

Усе састарэлыя метады і модулі былі выдалены.

## Убудовы CLI і TypeScript &gt;= 4.8

Убудовы NestJS CLI (даступныя для пакетаў `@nestjs/swagger` і `@nestjs/graphql` ) цяпер патрабуюць TypeScript &gt;= v4.8, таму старыя версіі TypeScript больш не будуць падтрымлівацца. Прычына гэтага змянення заключаецца ў тым, што ў [TypeScript v4.8 уведзена некалькі рэзкіх змяненняў](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html#decorators-are-placed-on-modifiers-on-typescripts-syntax-trees) у абстрактным сінтаксічным дрэве (AST), якое мы выкарыстоўваем для аўтаматычнага стварэння схем OpenAPI і GraphQL.

## Адмена падтрымкі для Node.js v12

Пачынаючы з NestJS 10, мы больш не падтрымліваем Node.js v12, паколькі [версія 12 была спынена](https://twitter.com/nodejs/status/1524081123579596800) 30 красавіка 2022 г. Гэта азначае, што для NestJS 10 патрабуецца Node.js v16 або вышэй. Гэта рашэнне было прынята, каб дазволіць нам нарэшце задаць мэту `ES2021` у нашай канфігурацыі TypeScript замест дастаўкі полізапаўненняў, як мы рабілі ў мінулым.

З гэтага моманту кожны афіцыйны пакет NestJS будзе кампілявацца ў `ES2021` па змаўчанні, што павінна прывесці да меншага памеру бібліятэкі, а часам нават да (крыху) лепшай прадукцыйнасці.

Мы таксама настойліва раім выкарыстоўваць апошнюю версію LTS.
