import React from "react";
import { Button } from "./ui/button";

const GoogleButton = ({ text = "Continue with Google" }) => {
  const handleGoogleAuth = () => {
    // Extract backend origin from API URL
    const backendOrigin = import.meta.env.VITE_API_URL.replace("/api/v1", "");

    // Full page redirect (required for OAuth)
    window.location.href = `${backendOrigin}/api/auth/google`;
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-2"
    >
      <span className="text-lg">G</span>
      {text}
    </Button>
  );
};

export default GoogleButton;
