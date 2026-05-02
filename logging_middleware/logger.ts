import axios from "axios";

let token = "";

export const setToken = (t: string) => {
  token = t;
};

export const Log = async (
  stack: "backend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string
) => {
  try {
    await axios.post(
      "http://20.207.122.201/evaluation-service/logs",
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (err: any) {
    console.error("Logging failed:", err.message);
  }
};