import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Mail, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import { DisclaimerPopup } from "./DisclaimerPopup";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
      <img
        src="/assets/generated/rural-nurse-care-logo-transparent.dim_400x400.png"
        alt="Home Care Nurse Logo"
        className="h-10 w-10 object-contain"
      />
      <span className="font-bold text-lg text-foreground">
        <span className="text-primary">Home</span>Care Nurse
      </span>
    </Link>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className="flex items-center rounded-full border border-primary/30 overflow-hidden text-xs font-semibold"
      style={{ background: "rgba(0,86,179,0.06)" }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 transition-all ${
          lang === "en"
            ? "bg-primary text-white"
            : "text-primary hover:bg-primary/10"
        }`}
        data-ocid="nav.toggle"
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("te")}
        className={`px-2.5 py-1 transition-all ${
          lang === "te"
            ? "bg-primary text-white"
            : "text-primary hover:bg-primary/10"
        }`}
        data-ocid="nav.toggle"
        aria-label="Switch to Telugu"
      >
        తె
      </button>
    </div>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t } = useLanguage();

  const NAV_LINKS = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.findNurse"), to: "/nurses" },
    { label: t("nav.register"), to: "/register" },
    { label: t("nav.nurseDashboard"), to: "/nurse-dashboard" },
    { label: t("nav.howItWorks"), to: "/#how-it-works" },
    { label: t("nav.admin"), to: "/admin" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerPopup />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to as string}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  currentPath === link.to
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-ocid="nav.link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <Link
              to="/nurses"
              search={{ pincode: undefined }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              data-ocid="nav.primary_button"
            >
              {t("nav.findNurses")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-card border-t border-border"
            >
              <nav className="flex flex-col py-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to as string}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="px-4 py-3">
                  <Link
                    to="/nurses"
                    search={{ pincode: undefined }}
                    className="block text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.primary_button"
                  >
                    {t("nav.findNurses")}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/assets/generated/rural-nurse-care-logo-transparent.dim_400x400.png"
                  alt="Home Care Nurse Logo"
                  className="h-12 w-12 object-contain"
                />
                <span className="font-bold text-lg text-foreground">
                  <span className="text-primary">Home</span>Care Nurse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connecting home care patients with trusted local nurses. Quality
                care, just a call away.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { label: t("nav.home"), to: "/" },
                  { label: t("nav.findNurse"), to: "/nurses" },
                  { label: t("nav.register"), to: "/register" },
                  { label: t("nav.nurseDashboard"), to: "/nurse-dashboard" },
                  { label: t("nav.howItWorks"), to: "/#how-it-works" },
                  { label: t("nav.admin"), to: "/admin" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to as string}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-ocid="footer.link"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">
                Contact Info
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail size={14} className="text-primary" />
                  <a
                    href="mailto:patnana.yuva@gmail.com"
                    className="hover:text-primary transition-colors"
                  >
                    patnana.yuva@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer box */}
          <div className="mt-8 bg-warning/15 border border-warning/40 rounded-xl px-5 py-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              ⚠️ Disclaimer / నిరాకరణ
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              This platform is an independent information service connecting
              patients with nursing professionals.{" "}
              <strong>Home Care Nurse/Unique Yuva</strong> does not employ these
              nurses, nor do we verify their daily clinical conduct.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Financial Responsibility:</strong> All financial
              transactions and service charges must be settled directly between
              the patient and the nurse. We do not collect any commission or
              payments, and we are not responsible for any financial disputes or
              losses.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Medical Advice:</strong> In emergencies, do not rely on
              this app; immediately call{" "}
              <span className="font-bold text-destructive">108</span> or visit
              the nearest Government PHC/Hospital. Use of this app is at your
              own risk.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Prescription Required:</strong> All treatments or services
              will be provided only with a valid prescription from a Qualified
              Doctor.
            </p>
            <hr className="border-warning/30" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">గమనిక:</strong> ఈ యాప్ కేవలం
              రోగులకు మరియు నర్సులకు మధ్య ఒక వారధిగా మాత్రమే పనిచేస్తుంది.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">డబ్బుల చెల్లింపులు:</strong>{" "}
              నర్సులకు ఇచ్చే ఫీజు లేదా ఇతర నగదు లావాదేవీలతో ఈ యాప్‌కు ఎటువంటి సంబంధం లేదు. మీ మధ్య
              జరిగే ఆర్థికపరమైన లావాదేవీలకు మీరే బాధ్యులు.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">వైద్య సలహా:</strong> అత్యవసర
              పరిస్థితుల్లో ఈ యాప్‌పై ఆధారపడకుండా వెంటనే{" "}
              <span className="font-bold text-destructive">108</span> కి కాల్ చేయండి
              లేదా దగ్గరలోని ప్రభుత్వ ఆసుపత్రిని సంప్రదించండి. నర్సులు అందించే చికిత్సకు లేదా వారి
              ప్రవర్తనకు ఈ యాప్ యాజమాన్యం బాధ్యత వహించదు.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">డాక్టర్ ప్రిస్క్రిప్షన్ అవసరం:</strong>{" "}
              అర్హత కలిగిన వైద్యుని ప్రిస్క్రిప్షన్ ఆధారంగా మాత్రమే చికిత్స లేదా సేవలు అందించబడతాయి.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with{" "}
            <Heart size={12} className="inline text-destructive" /> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LayoutInner>{children}</LayoutInner>
    </LanguageProvider>
  );
}
