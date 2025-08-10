"use client";

import React, { useState } from "react";

function Main() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();

      let processedImageUrl = data.imageUrl;

      if (
        data.imageUrl &&
        data.imageUrl.startsWith("data:image/jpeg;base64,")
      ) {
        const base64Data = data.imageUrl.replace("data:image/jpeg;base64,", "");

        try {
          // Check if the base64 is actually JSON
          const firstPart = base64Data.substring(0, 100);
          const decoded = atob(firstPart);

          if (decoded.trim().startsWith("{")) {
            // Decode the entire base64 as JSON
            const fullDecoded = atob(base64Data);
            const jsonData = JSON.parse(fullDecoded);

            // Look for actual image data in common fields
            if (
              jsonData.data &&
              jsonData.data[0] &&
              jsonData.data[0].b64_json
            ) {
              processedImageUrl = `data:image/png;base64,${jsonData.data[0].b64_json}`;
              console.log("✅ Using b64_json field");
            } else if (
              jsonData.data &&
              jsonData.data[0] &&
              jsonData.data[0].url
            ) {
              processedImageUrl = jsonData.data[0].url;
              console.log("✅ Using URL from JSON");
            } else if (jsonData.url) {
              processedImageUrl = jsonData.url;
              console.log("✅ Using direct URL from JSON");
            } else if (jsonData.image) {
              processedImageUrl = `data:image/png;base64,${jsonData.image}`;
              console.log("✅ Using image field");
            } else {
              console.log("❌ No recognizable image data found in JSON");
              setError("Invalid image format received from API");
              return;
            }
          }
        } catch (decodeError) {
          console.log("Decode/parse error:", decodeError);
          // If decoding fails, treat as regular base64 image
          console.log("Treating as regular base64 image");
        }
      } else if (
        data.imageUrl &&
        !data.imageUrl.startsWith("http") &&
        !data.imageUrl.startsWith("data:")
      ) {
        // Raw base64 string
        processedImageUrl = `data:image/jpeg;base64,${data.imageUrl}`;
        console.log("Processed as raw base64 JPEG");
      }

      setImageUrl(processedImageUrl);
    } catch (err) {
      setError(err.message || "Failed to generate image. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    try {
      if (imageUrl.startsWith("data:")) {
        // For base64 images
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `generated-${prompt
          .substring(0, 20)
          .replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For URL images
        fetch(imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `generated-${prompt
              .substring(0, 20)
              .replace(/[^a-zA-Z0-9]/g, "_")}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
          .catch((err) => {
            console.error("Download error:", err);
            setError("Failed to download image");
          });
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download image");
    }
  };

  const handleImageError = () => {
    console.error("Image failed to load, trying PNG format...");
    // If JPEG fails, try PNG
    if (imageUrl.includes("data:image/jpeg;base64,")) {
      const base64Data = imageUrl.replace("data:image/jpeg;base64,", "");
      const newImageUrl = `data:image/png;base64,${base64Data}`;
      setImageUrl(newImageUrl);
    } else {
      setError(
        "Failed to load generated image. The image format may not be supported."
      );
    }
  };

  return (
    <div className="h-[calc(100dvh-70px)] bg-gray-950 text-gray-100 p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-6">
        {/* Left side - Prompt input */}
        <div className="md:w-1/2 h-full flex flex-col">
          <h1 className="text-2xl font-bold mb-4 text-purple-400">
            AI Image Generator
          </h1>
          <p className="text-gray-400 mb-6">
            Describe the image you want to generate. Be as descriptive as
            possible for best results.
          </p>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at night with neon lights reflecting on wet streets..."
              className="flex-1 w-full p-4 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none text-gray-100 placeholder-gray-500"
              rows={8}
            />

            {error && (
              <div className="mt-2 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Image display */}
        <div className="md:w-1/2 h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Generated Image
          </h2>

          <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin-reverse"></div>
                  </div>
                </div>
                <p className="mt-4 text-gray-400">
                  Creating your masterpiece...
                </p>
              </div>
            ) : imageUrl ? (
              <div className="w-full h-full p-4 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Generated from prompt"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={handleImageError}
                  onLoad={() => console.log("Image loaded successfully")}
                />
              </div>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg">Your generated image will appear here</p>
                <p className="text-sm mt-2">
                  Enter a prompt and click "Generate Image"
                </p>
              </div>
            )}
          </div>

          {imageUrl && !isLoading && (
            <div className="mt-4 flex justify-end items-center">
          
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
