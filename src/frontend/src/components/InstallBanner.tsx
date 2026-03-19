import { Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

const DISMISS_KEY = "install_banner_dismissed";

export function InstallBanner() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(DISMISS_KEY) === "true";
  });

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (!isInstallable || dismissed) return null;

  return (
    <div
      data-ocid="install_banner.panel"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 shadow-lg"
      style={{ backgroundColor: "#0056b3" }}
    >
      <Smartphone className="shrink-0 text-white" size={22} />
      <p className="flex-1 text-sm text-white leading-snug">
        Install <strong>Home Care Nurse</strong> for quick access from your home
        screen
      </p>
      <button
        type="button"
        data-ocid="install_banner.primary_button"
        onClick={promptInstall}
        className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75"
        style={{ color: "#0056b3" }}
      >
        Install App
      </button>
      <button
        type="button"
        data-ocid="install_banner.close_button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="shrink-0 rounded-full p-1 text-white opacity-80 hover:opacity-100 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
}
