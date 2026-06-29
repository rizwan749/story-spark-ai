// Dynamically loads the Razorpay checkout script into the DOM
// Returns true if loaded successfully, false if it fails
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // SSR guard: exit early if not running in a browser
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};
