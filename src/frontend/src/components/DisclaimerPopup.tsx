import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "disclaimer_accepted_v3";

export function DisclaimerPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      data-ocid="disclaimer.modal"
    >
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full border border-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 py-5 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Important Disclaimer</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* English */}
          <div className="space-y-3">
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
              <span className="inline-flex items-center gap-1 font-bold text-destructive text-base">
                <Phone size={14} /> 108
              </span>{" "}
              or visit the nearest Government PHC/Hospital. Use of this app is
              at your own risk.
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Prescription Required:</strong> All treatments or services
              will be provided only with a valid prescription from a Qualified
              Doctor.
            </p>
          </div>

          {/* Telugu */}
          <div className="bg-muted rounded-lg px-4 py-3 space-y-2">
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
        </div>

        {/* Action */}
        <div className="px-6 pb-6 shrink-0">
          <Button
            onClick={handleAccept}
            className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="disclaimer.confirm_button"
          >
            I Understand / అర్థమైంది
          </Button>
        </div>
      </div>
    </div>
  );
}
