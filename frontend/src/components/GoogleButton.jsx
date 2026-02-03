import React from "react";
import { Button } from "./ui/button";

const GoogleButton = ({ text = "Continue with Google" }) => {
  const handleGoogleAuth = () => {
    // full page redirect is required for OAuth
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleAuth}
      className="w-full flex items-center justify-center gap-2"
    >
      {/* Simple G icon (no extra lib) */}
      <span className="text-lg">G</span>
      {text}
    </Button>
  );
};

export default GoogleButton;
