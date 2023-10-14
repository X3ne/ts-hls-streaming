# Torrent hls streaming

## Install ans start

Clone this repo, rename `.env.example` to .env and add your envs

```
npm install
```

Run in dev mode

```
npm run dev
```

Run server

```
npm run start
```

## Build

Just run

```
npm run build
```

## Docker

### envs

```
HOST=server host
PORT=port to start express server

API_KEY=api bearer token
```

Build the image

```
docker build . -t express-boilerplate
```

Run docker image

```
docker run --env API_KEY=token --env HOST=127.0.0.1 --env PORT=80 -p 80:80 express-boilerplate:latest
```
