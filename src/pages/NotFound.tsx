
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="text-center space-y-6 max-w-md animate-fade-in">
        <div className="mb-6">
          <div className="text-9xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</div>
          <h1 className="text-2xl font-semibold">Page not found</h1>
        </div>
        
        <p className="text-muted-foreground">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button asChild variant="default">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" /> 
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/vocabulary" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Go to Vocabulary
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
