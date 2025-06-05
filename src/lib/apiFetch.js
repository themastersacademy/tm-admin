"use client";
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 401) {
    console.warn("Session expired, redirecting to login...");
    const event = new CustomEvent("sessionExpired", {
      detail: {
        message: "Session expired, redirecting to login",
        variant: "error",
      },
    });
    window.dispatchEvent(event);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.assign("/login");
      }, 3000);
    }
    return null;
  }

  // if (!response.ok) {
  //   console.log(response);
  //   const data = await response.json()
  //   console.log(data);
  //   showSnackbar(
  //     "Session expired, redirecting to login",
  //     "error",
  //     "",
  //     "3000"
  //   );
  //   return await response.json();
  //   // throw new Error(`API Error: ${response.statusText}`);
  // }

  return await response.json();
}
