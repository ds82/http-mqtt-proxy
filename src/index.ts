import Hapi from "@hapi/hapi";
import { connect, MqttClient } from "mqtt";

//
// CONFIG VIA ENV VARIABLES
//
const HTTP_HOST = process.env?.HTTP_HOST ?? "localhost";
const HTTP_PORT = process.env?.HTTP_PORT ?? 3000;

const MQTT_URL = process.env?.MQTT_URL ?? "mqtt://localhost:1883";
const MQTT_USERNAME = process.env?.MQTT_USERNAME ?? "";
const MQTT_PASSWORD = process.env?.MQTT_PASSWORD ?? "";
const MQTT_CLIENTID = process.env?.MQTT_CLIENTID ?? "http-mqtt-proxy";
//

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
  console.log(`using mqtt-config`, {
    url: MQTT_URL,
    clientId: MQTT_CLIENTID,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  });
  const client: MqttClient = connect(MQTT_URL, {
    clientId: MQTT_CLIENTID,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
  });

  client.on("connect", () => {
    console.log(`MQTT connected to ${MQTT_URL}`);
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
    port: HTTP_PORT,
    host: HTTP_HOST,
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
