import mqtt from "mqtt";

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const TOPIC_DATA = "iot/fitness/data";
const TOPIC_CONTROL = "iot/fitness/control";

let batteryData = []; // store latest 1000 readings
const client = mqtt.connect(MQTT_BROKER);

export function initMQTT() {
  client.on("connect", () => {
    console.log("✅ Connected to MQTT broker");
    client.subscribe(TOPIC_DATA, () => {
      console.log(`📡 Subscribed to topic: ${TOPIC_DATA}`);
    });
  });

  client.on("message", (topic, message) => {
    if (topic === TOPIC_DATA) {
      try {
        const payload = JSON.parse(message.toString());
        console.log("🔋 Received:", payload);

        batteryData.push({
          voltage: payload.battery_voltage,
          percentage: payload.battery_percentage,
          timestamp: new Date().toISOString(),
        });

        if (batteryData.length > 1000) batteryData.shift();
      } catch (err) {
        console.error("❌ Invalid JSON from device:", message.toString());
      }
    }
  });
}

// 🔘 Send control commands (start / stop)
export function sendControlCommand(command) {
  if (!["start", "stop"].includes(command)) {
    console.error("⚠️ Invalid command:", command);
    return;
  }
  client.publish(TOPIC_CONTROL, command);
  console.log(`🚀 Sent command: ${command}`);
}

// 📤 Return current readings
export function getBatteryData() {
  return batteryData;
}
