"use server";

export const checkForClosePort = async (
  sandboxUrl: string
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(sandboxUrl, {
      signal: controller.signal,
      method: "HEAD", // return only headers
    });

    console.log("RESPONSE STATUS", response.status);

    clearTimeout(timeoutId);

    return response.status >= 200 && response.status < 300;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Port check timed out");
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.log("Connection refused or network error on port 3000");
    } else {
      console.log("Port check failed", error);
    }
    return false;
  }
};
