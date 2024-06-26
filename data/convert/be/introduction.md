# Уводзіны

Nest (NestJS) - гэта структура для стварэння эфектыўных серверных праграм [Node.js](https://nodejs.org/) з магчымасцю маштабавання. Ён выкарыстоўвае прагрэсіўны JavaScript, створаны і цалкам падтрымлівае [TypeScript](http://www.typescriptlang.org/) (але ўсё яшчэ дазваляе распрацоўшчыкам пісаць код у чыстым JavaScript) і спалучае ў сабе элементы ААП (аб'ектна-арыентаванага праграмавання), FP (функцыянальнага праграмавання) і FRP (функцыянальнага рэактыўнага праграмавання).

Пад капотам Nest выкарыстоўвае надзейныя фрэймворкі HTTP-сервера, такія як [Express](https://expressjs.com/) (па змаўчанні), і пры жаданні можа быць таксама настроены на выкарыстанне [Fastify](https://github.com/fastify/fastify) !

Nest забяспечвае ўзровень абстракцыі, вышэйшы за гэтыя агульныя структуры Node.js (Express/Fastify), але таксама паказвае іх API непасрэдна распрацоўшчыку. Гэта дае распрацоўнікам свабоду выкарыстання мноства старонніх модуляў, якія даступныя для асноўнай платформы.

## Філасофія

У апошнія гады, дзякуючы Node.js, JavaScript стаў «lingua franca» Інтэрнэту як для інтэрфейсных, так і для серверных прыкладанняў. Гэта прывяло да з'яўлення цудоўных праектаў, такіх як [Angular](https://angular.dev/) , [React](https://github.com/facebook/react) і [Vue](https://github.com/vuejs/vue) , якія павышаюць прадукцыйнасць распрацоўшчыкаў і дазваляюць ствараць хуткія інтэрфейсныя прыкладанні, якія можна правяраць і пашыраць. Аднак, нягледзячы на ​​тое, што для Node (і сервернага JavaScript) існуе мноства выдатных бібліятэк, памочнікаў і інструментаў, ніводная з іх не вырашае асноўнай праблемы - **архітэктуры** .

Nest забяспечвае гатовую архітэктуру прыкладанняў, якая дазваляе распрацоўшчыкам і камандам ствараць прыкладанні з высокім узроўнем тэставання, маштабаванасцю, слаба звязанымі і простымі ў абслугоўванні. Архітэктура ў значнай ступені натхнёная Angular.

## Ўстаноўка

Каб пачаць, вы можаце стварыць праект з дапамогай [Nest CLI](/cli/overview) або кланаваць стартавы праект (абодва дадуць аднолькавы вынік).

Каб стварыць канструкцыю праекта з дапамогай Nest CLI, выканайце наступныя каманды. Гэта створыць новы каталог праекта і запоўніць каталог першапачатковымі асноўнымі файламі Nest і дапаможнымі модулямі, ствараючы звычайную базавую структуру для вашага праекта. Новым карыстальнікам рэкамендуецца ствараць новы праект з дапамогай **Nest CLI** . Мы працягнем гэты падыход у [Першых кроках](first-steps) .

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

:::info **Падказка**
Каб стварыць новы праект TypeScript з больш строгім наборам функцый, перадайце сцяг `--strict` камандзе `nest new` . 
:::

## Альтэрнатывы

Акрамя таго, каб усталяваць пачатковы праект TypeScript з дапамогай **Git** :

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```

:::info **Падказка**

Калі вы жадаеце кланаваць рэпазітар без гісторыі git, вы можаце выкарыстоўваць [degit](https://github.com/Rich-Harris/degit) .

:::

Адкрыйце браўзер і перайдзіце да [`http://localhost:3000/`](http://localhost:3000/).

Каб усталяваць варыянт JavaScript пачатковага праекта, выкарыстоўвайце `javascript-starter.git` у паслядоўнасці каманд вышэй.

Вы таксама можаце ўручную стварыць новы праект з нуля, усталяваўшы ядро ​​і файлы падтрымкі з дапамогай **npm** (або **yarn** ). У гэтым выпадку, вядома, вы самі будзеце несці адказнасць за стварэнне шаблонных файлаў праекта.

```bash
$ npm i --save @nestjs/core @nestjs/common rxjs reflect-metadata
```
