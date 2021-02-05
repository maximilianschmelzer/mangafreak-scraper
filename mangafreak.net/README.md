# mangafreak to pdf

the script automatically downloads a zip file from mangafreak.net, unzips it, and converts separate images into one handy pdf for each chapter.

requirement is [nodejs](https://nodejs.org/en/), tested with v14.15.4

before first usage you have to install dependencies via `npm i` inside the project path

command `node manga {name}`

for example if you want to download following manga:

https://w11.mangafreak.net/Manga/Detective_Conan

the correct command would be `node manga Detective_Conan`

downloaded mangas can be found in `downloads/{name}/{name}_{1-x}.pdf`
