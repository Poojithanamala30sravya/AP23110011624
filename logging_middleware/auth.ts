import axios from "axios";

const BASE_URL = "http://20.207.122.201/evaluation-service";

export const getToken = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/auth`, {
  email: "poojithasravya_namala@srmap.edu.in",
  name: "n poojitha sravya",
  rollNo: "ap23110011624",
  accessCode: "QkbpxH",
  clientID: "7ea12684-4c35-491d-8ce7-c10aa4381aeb",
  clientSecret: "jHRNWVQVgdecvrNK"
});

    return res.data.access_token;
  } catch (err: any) {
    console.error("Auth failed:", err.message);
  }
};