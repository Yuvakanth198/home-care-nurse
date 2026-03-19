import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, MapPin, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { NurseCard } from "../components/NurseCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useListAllNurses } from "../hooks/useQueries";

export function HomePage() {
  const { t } = useLanguage();
  const [pincode, setPincode] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: nurses } = useListAllNurses();

  const ACTION_BUTTONS = [
    {
      id: "register",
      emoji: "🩺",
      title: t("home.register"),
      description: t("home.register.desc"),
      type: "link" as const,
      to: "/register",
      ocid: "home.register_button",
    },
    {
      id: "find",
      emoji: "🔍",
      title: t("home.find"),
      description: t("home.find.desc"),
      type: "link" as const,
      to: "/nurses",
      ocid: "home.find_button",
    },
    {
      id: "emergency",
      emoji: "🚨",
      title: t("home.emergency"),
      description: t("home.emergency.desc"),
      type: "tel" as const,
      tel: "108",
      ocid: "home.emergency_button",
    },
    {
      id: "about",
      emoji: "🏥",
      title: t("home.about"),
      description: t("home.about.desc"),
      type: "expand" as const,
      ocid: "home.about_button",
      expandContent: (
        <div className="text-sm text-gray-600 leading-relaxed">
          <p>{t("home.about.content")}</p>
          <p className="mt-2">{t("home.about.content2")}</p>
        </div>
      ),
    },
    {
      id: "contact",
      emoji: "✉️",
      title: t("home.contact"),
      description: t("home.contact.desc"),
      type: "expand" as const,
      ocid: "home.contact_button",
      expandContent: (
        <div className="text-sm">
          <p className="text-gray-500 mb-2">{t("home.contact.prompt")}</p>
          <a
            href="mailto:patnana.yuva@gmail.com"
            className="text-blue-700 font-semibold hover:underline text-base"
          >
            patnana.yuva@gmail.com
          </a>
        </div>
      ),
    },
  ];

  const handleSearch = () => {
    if (pincode.length === 6) {
      navigate({ to: "/nurses", search: { pincode } });
    } else {
      navigate({ to: "/nurses", search: { pincode: undefined } });
    }
  };

  const handleButtonClick = (btn: (typeof ACTION_BUTTONS)[number]) => {
    if (btn.type === "link") {
      navigate({ to: btn.to as "/register" | "/nurses" });
    } else if (btn.type === "tel") {
      window.location.href = `tel:${btn.tel}`;
    } else {
      setExpanded((prev) => (prev === btn.id ? null : btn.id));
    }
  };

  const displayNurses = nurses && nurses.length > 0 ? nurses.slice(0, 6) : [];

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[480px] md:min-h-[560px] flex items-center"
        style={{
          background:
            "linear-gradient(to right, rgba(0,86,179,0.92) 0%, rgba(0,50,110,0.75) 50%, rgba(0,0,0,0.35) 100%), url('/assets/generated/hero-rural-nurse.dim_1400x700.jpg') center/cover no-repeat",
        }}
      >
        <div className="container mx-auto px-4 py-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4 border border-white/30">
              Trusted Home Healthcare Network
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {t("home.welcome")}
            </h1>
            <p className="mt-4 text-white/85 text-base md:text-lg leading-relaxed">
              {t("home.tagline")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-md"
          >
            <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
              <div className="flex-1 flex items-center gap-2 px-2">
                <Search size={18} className="text-gray-400 shrink-0" />
                <Input
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder={t("home.search.placeholder")}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  data-ocid="hero.input"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg shrink-0"
                data-ocid="hero.primary_button"
              >
                {t("home.search.btn")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-blue-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 py-5 divide-x divide-white/20">
            {[
              { value: "500+", label: "Verified Nurses" },
              { value: "50,000+", label: "Patients Served" },
              { value: "200+", label: "Pincodes Covered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Vertical Action Buttons */}
      <section className="container mx-auto px-4 py-10 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#0056b3" }}
          >
            What Would You Like to Do?
          </h2>
          <p className="mt-2 text-gray-500">
            Quick access to everything Home Care Nurse offers
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {ACTION_BUTTONS.map((btn, i) => (
            <motion.div
              key={btn.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <button
                type="button"
                onClick={() => handleButtonClick(btn)}
                data-ocid={btn.ocid}
                className="action-btn w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      border: "2px solid #90caf9",
                    }}
                  >
                    {btn.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-base"
                      style={{ color: "#0056b3" }}
                    >
                      {btn.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {btn.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-blue-400 shrink-0 transition-transform"
                    style={{
                      transform:
                        expanded === btn.id ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </div>
              </button>

              {btn.type === "expand" && (
                <AnimatePresence>
                  {expanded === btn.id && (
                    <motion.div
                      key={`expand-${btn.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-2 mt-2 mb-1 p-4 rounded-xl"
                        style={{
                          background: "#f0f7ff",
                          border: "1px solid #bbdefb",
                        }}
                      >
                        {btn.expandContent}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Nurses */}
      <section className="container mx-auto px-4 py-10 pt-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#0056b3" }}
          >
            {t("home.nurses.heading")}
          </h2>
          <p className="mt-2 text-gray-500">{t("home.nurses.subheading")}</p>
        </motion.div>

        {displayNurses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayNurses.map((nurse, i) => (
                <NurseCard key={nurse.id} nurse={nurse} index={i + 1} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: "/nurses", search: { pincode: undefined } })
                }
                className="border-primary text-primary hover:bg-primary hover:text-white gap-2"
                data-ocid="home.secondary_button"
              >
                {t("home.nurses.viewAll")}
              </Button>
            </div>
          </>
        ) : (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: "#f0f7ff", border: "1px dashed #90caf9" }}
            data-ocid="nurses.empty_state"
          >
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-lg font-semibold" style={{ color: "#0056b3" }}>
              {t("home.nurses.empty")}
            </h3>
            <Button
              onClick={() => navigate({ to: "/register" })}
              className="mt-5 bg-blue-700 hover:bg-blue-800 text-white"
              data-ocid="home.register_button"
            >
              {t("home.nurses.register")}
            </Button>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-14" style={{ background: "#f0f7ff" }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "#0056b3" }}
            >
              {t("home.how.title")}
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "📍",
                title: t("home.how.step1.title"),
                desc: t("home.how.step1.desc"),
              },
              {
                emoji: "👤",
                title: t("home.how.step2.title"),
                desc: t("home.how.step2.desc"),
              },
              {
                emoji: "📞",
                title: t("home.how.step3.title"),
                desc: t("home.how.step3.desc"),
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ background: "#dbeafe" }}
                >
                  {step.emoji}
                </div>
                <div
                  className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center mx-auto mb-2"
                  style={{ background: "#0056b3" }}
                >
                  {i + 1}
                </div>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "#0056b3" }}
                >
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14" style={{ background: "#0056b3" }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {t("home.cta.title")}
          </h2>
          <p className="mt-3 text-white/80 max-w-md mx-auto">
            {t("home.cta.desc")}
          </p>
          <Button
            onClick={() =>
              navigate({ to: "/nurses", search: { pincode: undefined } })
            }
            className="mt-6 bg-white hover:bg-white/90 font-semibold gap-2"
            style={{ color: "#0056b3" }}
            data-ocid="home.secondary_button"
          >
            <MapPin size={16} /> {t("home.cta.find")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        <div className="flex flex-col items-center gap-1">
          <p>
            {t("home.cta.emergency")}{" "}
            <a
              href="tel:108"
              className="text-red-400 font-bold hover:underline"
            >
              108
            </a>
          </p>
          <p>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
