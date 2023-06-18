# http-mqtt-proxy

This simple project aims to translate http requests to mqtt topics. It is used in my smarthome mainly to proxy doorbird events (bell trigger, motion, etc.) to mqtt and to process these in other systems.

It opens a http server that translate every GET Request to an arbtiary path to the same mqtt topic on the configured broker passing along all query parameters as JSON encoded data.

E.g., if you request this URL:

```
http://localhost:3000/some/path?color=black&value=100
```

It sends the following mqtt message:

```
some/path: '{"color": "black", "value": "100"}'
```

## credits

Project setup loosely following https://medium.com/before-semicolon/how-to-setup-a-typescript-nodejs-server-2023-16f3874f2ce5
