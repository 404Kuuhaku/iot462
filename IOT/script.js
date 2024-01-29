$(document).ready(function () {
    let isConnected = false;
    const pubTurnOnTopic = "462/turnOn";
    const pubTurnOffTopic = "462/turnOff";
    const pubAutoModeTopic = "462/autoMode";
    const pubManualModeTopic = "462/manualMode";
    //Change topic to pump controller (this for test only)
    const subTurnOnTopic = "462/turnOn";
    const subTurnOffTopic = "462/turnOff";
    const subAutoModeTopic = "462/autoMode";
    const subManualModeTopic = "462/manualMode";
    const client = mqtt.connect("ws://broker.emqx.io/mqtt", {
      port: 8083,
    });
  
    client.on("connect", function () {
      isConnected = true;
      client.subscribe("462/temp_humid");
      client.subscribe("462/light");
      client.subscribe(subTurnOnTopic);
      client.subscribe(subTurnOffTopic);
      client.subscribe(subAutoModeTopic);
      client.subscribe(subManualModeTopic);
    });
  
    client.on("message", function (topic, message) {
      handleMqttMessage(topic, message);
    });
  
    $("#turn-on-button").on("click", function () {
      publishCommand(pubTurnOnTopic);
    });
  
    $("#turn-off-button").on("click", function () {
      publishCommand(pubTurnOffTopic);
    });
  
    $("#auto-button").on("click", function () {
      publishCommand(pubAutoModeTopic);
    });
  
    $("#manual-button").on("click", function () {
      publishCommand(pubManualModeTopic);
    });
  
    function handleMqttMessage(topic, message) {
      console.log(topic);
      console.log(message.toString());
  
      if (topic == "462/temp_humid") {
        updateTemperatureAndHumidity(message.toString());
      }
  
      if (topic == subTurnOnTopic) {
        updateOnOffTag("เปิด", "rgb(108, 212, 178)");
      }
      if (topic == subTurnOffTopic) {
        updateOnOffTag("ปิด", "#333");
      }
      if (topic == subAutoModeTopic) {
        updateModeTag("อัตโนมัติ", "rgb(108, 212, 178)");
      }
      if (topic == subManualModeTopic) {
        updateModeTag("ด้วยตนเอง", "#333");
      }
    }
  
    function updateTemperatureAndHumidity(messageString) {
      var messageParts = messageString.split(",");
      var humidity = messageParts[0];
      var temperature = messageParts[1];
      var heatIndex = calculateHeatIndex(temperature, humidity);
      const textColor = "rgb(255, 135, 135)";
  
      $("h1#humiTag").text(humidity).css("color", textColor);
      $("h1#tempTag").text(temperature).css("color", textColor);
      $("h1#heatIndexTag").text(heatIndex).css("color", textColor);
  
      setTimeout(function () {
        $("h1#humiTag, h1#tempTag, h1#heatIndexTag").css("color", "#333");
      }, 1000);
    }
  
    function updateOnOffTag(text, color) {
      $("h1#on-off-tag").text(text).css("color", color);
    }
  
    function updateModeTag(text, color) {
      $("h1#mode-tag").text(text).css("color", color);
    }
  
    function publishCommand(topic) {
      if (!isConnected) {
        console.log("Cannot send command");
        return;
      }
      client.publish(topic, "");
    }
  
    function calculateHeatIndex(celsiusTemperature, humidity) {
      if (celsiusTemperature < 26.67 || humidity < 40 || humidity > 100) {
        console.log("Invalid temperature or humidity input");
        return null;
      }
  
      var heatIndex =
        -8.78469475556 +
        1.61139411 * celsiusTemperature +
        2.33854883889 * humidity -
        0.14611605 * celsiusTemperature * humidity -
        0.012308094 * celsiusTemperature ** 2 -
        0.0164248277778 * humidity ** 2 +
        0.002211732 * celsiusTemperature ** 2 * humidity +
        0.00072546 * celsiusTemperature * humidity ** 2 -
        0.000003582 * celsiusTemperature ** 2 * humidity ** 2;
  
      return heatIndex.toFixed(2);
    }
  });
  