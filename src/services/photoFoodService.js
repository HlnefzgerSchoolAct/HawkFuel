/**
 * Photo Food Identification Service
 * Sends food photos to the backend for AI identification + USDA nutrition lookup
 */

import devLog from "../utils/devLog";

const API_ENDPOINT = "/api/identify-food-photo";
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Resize an image to max dimension while maintaining aspect ratio
 * Returns a base64 JPEG string
 */
export function resizeImage(base64DataUrl, maxDimension = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const resizedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(resizedDataUrl);
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = base64DataUrl;
  });
}

/**
 * Capture a still frame from a video element as base64 JPEG
 */
export function captureVideoFrame(videoElement, quality = 0.7) {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0);

  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Read a File object as a base64 data URL
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Format error message for user display
 */
function formatErrorMessage(errorData, status) {
  const errorMessages = {
    RATE_LIMITED: "Too many photo requests. Please wait a few minutes.",
    API_RATE_LIMITED: "AI service is busy. Please try again in a moment.",
    IMAGE_TOO_LARGE: "Image is too large. Try taking a lower resolution photo.",
    MISSING_INPUT: "No image provided.",
    VISION_ERROR: "Could not analyze the photo. Please try again.",
    TIMEOUT: "Request timed out. Please try again with a clearer photo.",
    SERVER_CONFIG_ERROR: "Service not configured. Please contact support.",
    AUTH_ERROR: "Authentication error. Please try again later.",
  };

  if (errorData?.code && errorMessages[errorData.code]) {
    return errorMessages[errorData.code];
  }

  if (status === 429) return errorMessages.RATE_LIMITED;
  if (status >= 500) return "Server error. Please try again.";

  return errorData?.error || "Failed to identify food. Please try again.";
}

/**
 * Identify food from a photo
 * @param {string} base64Image - Base64 data URL of the food image
 * @returns {Promise<{foods: Array, message?: string}>} Identified foods with nutrition
 */
export async function identifyFoodFromPhoto(base64Image) {
  devLog.log("📸 Identifying food from photo...");

  // Resize before sending to reduce payload and improve speed
  let processedImage;
  try {
    processedImage = await resizeImage(base64Image, 1024, 0.7);
  } catch {
    devLog.warn("Image resize failed, using original");
    processedImage = base64Image;
  }

  // Strip data URI prefix for transport
  const imageData = processedImage.replace(/^data:image\/\w+;base64,/, "");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }

      const message = formatErrorMessage(errorData, response.status);
      throw new Error(message);
    }

    const data = await response.json();
    devLog.log("📸 Photo identification result:", data);

    return data;
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("Photo analysis timed out. Please try again with a clearer photo.");
    }

    // Re-throw formatted errors
    if (error.message && !error.message.includes("fetch")) {
      throw error;
    }

    throw new Error("Could not connect to the server. Check your internet connection.");
  }
}
