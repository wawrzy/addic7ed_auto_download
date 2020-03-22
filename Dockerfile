FROM arm32v7/node:alpine

COPY . /app

WORKDIR /app

ENV BLACK_LIST=""
ENV SUBTITLE_LANGUAGE_CODE="fr"
ENV SUBTITLE_FILENAME_EXTENSION="srt"
ENV ADDIC7ED_LANGUAGE_CODE="fre"

RUN npm install pm2 -g && yarn

ENTRYPOINT ["pm2-runtime", "app.js", "--cron", "42 9 * * *", "--no-autorestart", "--no-auto-exit"]
