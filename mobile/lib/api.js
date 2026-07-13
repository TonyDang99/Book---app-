import { API_URL } from "../constants/api";

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const trimmedText = text.trim();
    return {
      _invalidJson: true,
      message: trimmedText.startsWith("<") ? null : trimmedText,
    };
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
    const message = data?._invalidJson
      ? `Request failed with status ${response.status}`
      : data?.message || `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (data?._invalidJson) {
    throw new Error(data.message || "Server returned an invalid response");
  }

  return data;
};
