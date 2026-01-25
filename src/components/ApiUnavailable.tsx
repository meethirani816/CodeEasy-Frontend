import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/api/apiClient";

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

const ApiUnavailable: React.FC<Props> = ({
  title = "Can't reach your backend",
  description = "We couldn't load data from your API, so CodeEasy has nothing to show.",
  onRetry,
}) => {
  const isMixedContentBlocked =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    API_BASE_URL.startsWith("http://");

  return (
    <div className="max-w-2xl">
      <Alert>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{description}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              API base URL: <span className="font-mono">{API_BASE_URL}</span>
            </p>
            {isMixedContentBlocked && (
              <p>
                Your app is served over HTTPS, so the browser blocks requests to an HTTP API (mixed
                content). Expose your backend over HTTPS (e.g. a tunnel) and set
                <span className="font-mono"> VITE_API_URL</span> to that HTTPS URL.
              </p>
            )}
            {!isMixedContentBlocked && (
              <p>
                Check that your backend is running and that CORS allows requests from this site.
              </p>
            )}
          </div>

          {onRetry && (
            <div>
              <Button variant="outline" onClick={onRetry}>
                Retry
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiUnavailable;
