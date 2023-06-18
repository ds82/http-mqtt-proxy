import Hapi from "@hapi/hapi";
import { connect, MqttClient } from "mqtt";

import config from "../config.json";

type InitHttpParams = {
  client: MqttClient;
};

type LoadRoutesParams = {
  client: MqttClient;
  server: Hapi.Server;
};

const init = async () => {
  const { client } = initMqtt();
  initHttp({ client });
};

const initMqtt = () => {
  const client: MqttClient = connect(config.mqtt.url, {
    clientId: config?.mqtt?.clientId ?? "http-mqtt-proxy",
    username: config.mqtt.username,
    password: config.mqtt.password,
  });

  client.on("connect", () => {
    console.log(`MQTT connected to ${config.mqtt.url}`);
  });

  client.on("message", (topic, message) => {
    console.log(topic, message.toString());
  });

  client.on("error", (err) => {
    console.log("Error connection to mqtt broker", err);
  });

  return { client };
};

const initHttp = async ({ client }: InitHttpParams) => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
  });

  loadRoutes({ server, client });

  await server.start();
  console.log("Server running on %s", server.info.uri);
  return { server };
};

const loadRoutes = async ({ server, client }: LoadRoutesParams) => {
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  });
  server.route({
    method: "GET",
    path: "/{path*}",
    handler: (request, h) => {
      console.log(request.params.path, request.query);
      client.publish(request.params.path, JSON.stringify(request.query));
      return "OK";
    },
  });
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
