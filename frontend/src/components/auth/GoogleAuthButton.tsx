"use client";

import Script from "next/script";
import { useCallback, useId, useRef, useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** The subset of Google Identity Services this component touches. */
interface GoogleIdentity {
  accounts?: {
    id?: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme: "outline" | "filled_blue" | "filled_black";
          size: "large" | "medium" | "small";
          width?: number;
          text?: "signin_with" | "signup_with" | "continue_with";
          shape?: "rectangular" | "pill" | "circle" | "square";
        }
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

interface GoogleAuthButtonProps {
  /** Receives the Google ID token. The caller decides sign-in vs sign-up. */
  onCredential: (idToken: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
  disabled?: boolean;
}

/**
 * Renders Google's own sign-in button via Google Identity Services.
 *
 * The button must be Google's, not a look-alike: the ID token is minted by
 * their SDK and verified server-side against our client id. A hand-rolled
 * button could not produce a token our API would accept.
 *
 * With no client id configured the component says so plainly instead of
 * rendering a control that silently does nothing.
 */
export function GoogleAuthButton({
  onCredential,
  text = "signin_with",
  disabled = false,
}: GoogleAuthButtonProps) {
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCredential = useCallback(
    (response: { credential?: string }) => {
      if (response.credential) onCredential(response.credential);
    },
    [onCredential]
  );

  // Runs from the script's onLoad (an event, not an effect): the SDK is
  // present exactly once, and the container is already mounted.
  const initialize = useCallback(() => {
    const identity = window.google?.accounts?.id;

    if (!CLIENT_ID || !identity || !containerRef.current) {
      setFailed(true);
      return;
    }

    try {
      identity.initialize({ client_id: CLIENT_ID, callback: handleCredential });
      identity.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text,
        shape: "rectangular",
      });
      setScriptReady(true);
    } catch {
      setFailed(true);
    }
  }, [handleCredential, text]);

  if (!CLIENT_ID) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-[11px] text-slate-500">
        Google sign-in is not configured. Set{" "}
        <span className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</span> to
        enable it.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
        onError={() => setFailed(true)}
      />

      {failed ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-[11px] text-amber-800">
          Google sign-in could not load. Check your connection, or use email and
          password below.
        </div>
      ) : (
        <div
          id={containerId}
          ref={containerRef}
          aria-busy={!scriptReady}
          className={`flex justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}
        />
      )}
    </>
  );
}
