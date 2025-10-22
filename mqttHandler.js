import mqtt from "mqtt";
import db from "./db.js";

const MQTT_BROKER = "mqtt://broker.hivemq.com";
const TOPIC_DATA = "iot/fitness/data";
const TOPIC_CONTROL = "iot/fitness/control";

const client = mqtt.connect(MQTT_BROKER);

let dataBuffer = [];

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker!");
  client.subscribe(TOPIC_DATA, (err) => {
    if (!err) console.log(`📡 Subscribed to topic: ${TOPIC_DATA}`);
  });
});

// 📥 Handle incoming workout data
client.on("message", (topic, message) => {
  if (topic === TOPIC_DATA) {
    try {
      const payload = JSON.parse(message.toString());
      const { reps, weight, battery_voltage } = payload;

      dataBuffer.push({ reps, weight, battery_voltage , timestamp: new Date().toISOString() });
      if (dataBuffer.length > 1000) dataBuffer.shift();

      if (dataBuffer.length % 100 === 0) flushToDB();
      console.log("📈 Received:", payload);
    } catch (err) {
      console.error("❌ Error parsing MQTT message:", err);
    }
  }
});

// 💾 Flush to database
function flushToDB() {
  const stmt = db.prepare(
    "INSERT INTO fitness_data (reps, weight, battery, timestamp) VALUES (?, ?, ?, ?)"
  );
  dataBuffer.forEach((d) => stmt.run(d.reps, d.weight, d.battery_voltage, d.timestamp));
  stmt.finalize();
  console.log("✅ Data flushed to DB");
}

// 📤 Publish control command ("start" / "stop")
function sendControlCommand(command) {
  if (!["start", "stop"].includes(command)) {
    console.error("❌ Invalid command:", command);
    return;
  }
  client.publish(TOPIC_CONTROL, command, { qos: 1, retain: false });
  console.log(`🚀 Sent command: ${command}`);
}

export { client, dataBuffer, sendControlCommand, flushToDB };
