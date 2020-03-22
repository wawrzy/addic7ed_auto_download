# addic7ed_auto_download

Automatically download subtitles of a tv show from the Addic7ed website.

Process restart every day at 10:42 am

## Docker

***Use arm32v7/node:alpine image for raspberry pi***

```sh
docker run \
  -v "/path/to/series:/tv" \
  -e BLACK_LIST="The Mandalorian" \
  -e SUBTITLE_LANGUAGE_CODE="fr" \
  -e ADDIC7ED_LANGUAGE_CODE="fre" \
  --name auto_download_sub \
  -d julienwawrzyniak/addic7ed_auto_download:latest
```

| ENV VARIABLE                | DESCRIPTION             | Default  |
| -------------------         |:-----------------------:| -----:|
| BLACK_LIST                  | TV shows to ignore (separate by `;`) | none |
| SUBTITLE_LANGUAGE_CODE      | Language code in filename      |   fr |
| ADDIC7ED_LANGUAGE_CODE      | Addic7ed language code (https://www.npmjs.com/package/addic7ed-api)      |    fre |
