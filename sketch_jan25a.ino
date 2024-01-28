#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#define DHTPIN 32
#define DHTTYPE DHT11 
const char* ssid = "AMM1";
const char* password = "FM-AMM@2019";

const char* mqtt_server = "broker.emqx.io";

WiFiClient espClient;
PubSubClient client(espClient);

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // put your setup code here, to run once:
  WiFi.begin(ssid, password);
  Serial.begin(9600);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  client.setServer(mqtt_server, 1883);
  dht.begin();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  char buff[20];
  String dataStr = String(h) + "," + String(t);
  dataStr.toCharArray(buff, sizeof(buff));
  Serial.println(buff);
  client.publish("462/temp_humid",buff);
  client.loop();
  delay(5000);
  
}


void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("AMM_Tester")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
