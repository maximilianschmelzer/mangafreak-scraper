# manga-dl

a collection of scripts used to download manga from websites and convert to pdf files for local reading of your favourite manga, no matter the device.

## requirements

* [nodejs](https://nodejs.org/en/) (tested with v14.15.4)

## examples

* before first use install dependencies via `npm i` inside the project folder
* downloaded mangas can be found inside `downloads/{website}/{title}/{chapter}_{1-x}.pdf`

### manganelo

`npm run manganelo {title} {firstChapter} {lastChapter}`

https://manganelo.com/manga/hyer5231574354229

`npm run manganelo hyer5231574354229 1 1000`

### mangafreak to pdf

`npm run mangafreak {title}`

https://w11.mangafreak.net/Manga/Detective_Conan

`npm run mangafreak Detective_Conan`
