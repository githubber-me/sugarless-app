// Expo configuration with environment variables
// This file configures the app with necessary environment variables for the Roboflow API

export default {
  expo: {
    name: "sugarless-app",
    slug: "sugarless-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      NEXT_PUBLIC_ROBOFLOW_API_KEY: process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY,
    }
  }
};
