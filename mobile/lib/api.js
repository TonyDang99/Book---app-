import { API_URL } from "../constants/api";

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const trimmedText = text.trim();
    const fallbackMessage = trimmedText.startsWith("<")
      ? "Server returned an invalid response"
      : trimmedText || "Server returned an invalid response";
    throw new Error(fallbackMessage);
  }
};

export const fetchApi = async (path, options = {}) => {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(`Cannot connect to the API at ${API_URL}. Make sure the backend is running.`);
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};
