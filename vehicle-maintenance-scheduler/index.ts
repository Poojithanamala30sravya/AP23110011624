import axios from "axios";
import { getToken } from "../logging_middleware/auth";
import { setToken, Log } from "../logging_middleware/logger";

const BASE_URL = "http://20.207.122.201/evaluation-service";

// 📡 Fetch Data
const fetchData = async () => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error("Token not received");
    }

    setToken(token);
   console.log("TOKEN:", token);
    await Log("backend", "info", "service", "Token initialized");

    const depotRes = await axios.get(`${BASE_URL}/depots`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await Log("backend", "info", "service", "Fetched depot data");

    const vehicleRes = await axios.get(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await Log("backend", "info", "service", "Fetched vehicle data");

    return {
      depots: depotRes.data.depots,
      vehicles: vehicleRes.data.vehicles,
    };
  } catch (err: any) {
    await Log("backend", "error", "service", err.message);
    throw err;
  }
};

// 🧠 Knapsack Logic
const knapsack = (tasks: any[], maxHours: number) => {
  const n = tasks.length;

  const dp = Array(n + 1)
    .fill(0)
    .map(() => Array(maxHours + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = tasks[i - 1];

    for (let w = 0; w <= maxHours; w++) {
      if (Duration <= w) {
        dp[i][w] = Math.max(
          Impact + dp[i - 1][w - Duration],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][maxHours];
};

// 🚀 Main Function
const main = async () => {
  try {
    console.log("Starting scheduler...");

    const data = await fetchData();

    const depot = data.depots[0];
    const vehicles = data.vehicles;

    await Log(
      "backend",
      "debug",
      "service",
      `Mechanic Hours: ${depot.MechanicHours}`
    );

    await Log(
      "backend",
      "debug",
      "service",
      `Total Vehicles: ${vehicles.length}`
    );

    const result = knapsack(vehicles, depot.MechanicHours);

    console.log("✅ Max Impact:", result);

    await Log(
      "backend",
      "info",
      "service",
      `Final Max Impact: ${result}`
    );

    await Log("backend", "info", "service", "Scheduler completed");
  } catch (err: any) {
    console.error("❌ Error:", err.message);

    await Log("backend", "fatal", "service", err.message);
  }
};

main();