# Aloes - LoraWan Transport

- Decrypt and encrypt Lora packet
- Authentification by OTAA and ABP via Aloes device-manager
- MQTT flow triggered by LoraWan server events
- Decode payload received/sent with CayenneLPP
- Store Gateways and Devices state 

[Full Docs](https://aloes.frama.io/lorawan-transport/)

LoraWan MQTT API build upon :

- [NodeJS](https://nodejs.org/en/)
- [LoraWAN Server](https://github.com/ioberry/LoraWAN-Server)
- [Lora-Packet](https://github.com/anthonykirby/lora-packet)
- [MQTT.js](https://github.com/mqttjs)
- [Aloes handlers](https://framagit.org/aloes/aloes-handlers)
- [Device manager](https://framagit.org/aloes/device-manager)

---

## Folder structure

- /. --> Main application configuration, dependencies list, and launch scripts

- /deploy --> contains environment variables ( hidden files )

- /docs --> contains static site assets and configuration ( JSDoc & Vuepress)

- /log --> contains logs from PM2

- /src --> contains source code

## Configuration

Edit your config in `.env_sample` and save it as `.env`.
You can override these by populating `deploy` with files corresponding to an environment ( eg: .env_production ... ), and via pm2 `ecosystem.config.json` .

## Installation

```bash
  $ npm install -g pm2
  $ npm install
```

## Linting

```bash
  $ npm run lint
```

## Running the development server (REST API)

```bash
  $ npm run start:dev
```

## Generate documentation

With JSDoc and Vuepress

```bash
$ npm run docs:dev
```

```bash
$ npm run docs:build
$ npm run docs:serve
```

## Deploying project

Please remember to update `.env` and / or `ecosystem.config.json` files to match your enviroment.

- Access to server with SSH :

```bash
  $ ssh-keygen -f ~/.ssh/server_name -t rsa -C <email_address> -b 4096
  $ ssh-copy-id -i ~/.ssh/server_name user@server_uri
```

- Creating environment :

```bash
  $ npm run setup:prod
```

- Updating environment :

```bash
  $ npm run update:prod
```

Be sure to commit your changes on the right branch before each setup and update: ( master for production env, and staging for dev/staging env )

```bash
  $  git checkout master
  $  git add .
  $  git commit .
  $  git push
```
