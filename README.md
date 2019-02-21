# Aloes - LoraWan Transport

- Decrypt and encrypt Lora packet
- Authentification by OTAA and ABP via Aloes device-manager
- MQTT flow triggered by LoraWan server events
- Decode payload received/sent with CayenneLPP


LoraWan MQTT API build upon :
- [NodeJS](https://nodejs.org/en/)
- [LoraWAN Server](https://github.com/ioberry/LoraWAN-Server)
- [Lora-Packet](https://github.com/anthonykirby/lora-packet)
- [MQTT.js](https://github.com/mqttjs)
- [Aloes handlers](https://www.npmjs.com/package/aloes-handlers)
- [Device manager](https://framagit.org/getlarge/device-manager)

-----


## Folder structure

- /. --> Main application configuration, dependencies list, and launch scripts

- /deploy --> contains environment variables ( hidden files )

- /log --> contains logs from PM2

- /src --> contains source code



## Configuration

Edit your config in .env_sample and save it as `.env`.
You can override these by populating `deploy` with files corresponding to an environment ( eg: .env_production ... ), and via pm2 `ecosystem.config.json` .


## Installation

``` bash
  $ npm install -g pm2
  $ npm install
```


## Linting

```bash
  $ npm run lint
```


## Running the development server (REST API)

```bash
  $ npm run dev
```


## Deploying project

Please remember to update `.env` and / or `ecosystem.config.json` files to match your enviroment.

```bash
  $ npm run start
```


### You can also launch this app with pm2 :

- Access to server with SSH :

```bash
  $ ssh-keygen -f ~/.ssh/server_name -t rsa -C <email_address> -b 4096
  $ ssh-copy-id -i ~/.ssh/server_name user@server_uri
```

- Creating environment :

```bash
  $ pm2 deploy ecosystem.config.js production setup
```

- Updating environment :

```bash
  $ pm2 deploy ecosystem.config.js production update
```

Be sure to commit your changes on the right branch before each setup and update: ( master for production env, and staging for dev/staging env )

```bash
  $  git checkout master
  $  git add .
  $  git commit .
  $  git push
```
