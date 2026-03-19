import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Loader2,
  MapPin,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type Nurse } from "../backend";
import {
  useAddNurse,
  useDeleteNurse,
  useIsCallerAdmin,
  useListAllNurses,
  useUpdateNurse,
} from "../hooks/useQueries";
import { v4 as uuidv4 } from "../utils/uuid";

interface NurseFormData {
  name: string;
  registrationNumber: string;
  phone: string;
  village: string;
  mandal: string;
  district: string;
  pincode: string;
  experience: string;
  bio: string;
  isAvailable: boolean;
  photoFile: File | null;
}

const EMPTY_FORM: NurseFormData = {
  name: "",
  registrationNumber: "",
  phone: "",
  village: "",
  mandal: "",
  district: "",
  pincode: "",
  experience: "",
  bio: "",
  isAvailable: true,
  photoFile: null,
};

function NurseForm({
  initial,
  onSubmit,
  isPending,
  submitLabel,
}: {
  initial: NurseFormData;
  onSubmit: (data: NurseFormData) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<NurseFormData>(initial);

  const set = (
    key: keyof NurseFormData,
    value: string | boolean | File | null,
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
      data-ocid="admin.modal"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Nurse full name"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="reg-number">Nursing Council Reg. No. *</Label>
          <Input
            id="reg-number"
            value={form.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value)}
            placeholder="e.g. AP/RN/2018/04521"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="village">Village *</Label>
          <Input
            id="village"
            value={form.village}
            onChange={(e) => set("village", e.target.value)}
            placeholder="e.g. Narasannapeta"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label htmlFor="mandal">Mandal *</Label>
          <Input
            id="mandal"
            value={form.mandal}
            onChange={(e) => set("mandal", e.target.value)}
            placeholder="e.g. Narasannapeta"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="e.g. Srikakulam"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={form.pincode}
            onChange={(e) =>
              set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="6-digit pincode"
            maxLength={6}
            inputMode="numeric"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div>
          <Label htmlFor="experience">Experience (years) *</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={60}
            value={form.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder="e.g. 8"
            required
            className="mt-1"
            data-ocid="admin.input"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="available"
            checked={form.isAvailable}
            onCheckedChange={(v) => set("isAvailable", v)}
            data-ocid="admin.switch"
          />
          <Label htmlFor="available">Available</Label>
        </div>
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          placeholder="Brief professional summary..."
          rows={3}
          className="mt-1"
          data-ocid="admin.textarea"
        />
      </div>
      <div>
        <Label htmlFor="photo">Profile Photo</Label>
        <label
          htmlFor="photo"
          className="mt-1 flex items-center gap-2 w-full border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:border-primary transition-colors"
          data-ocid="admin.upload_button"
        >
          <Upload size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {form.photoFile ? form.photoFile.name : "Click to upload photo"}
          </span>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => set("photoFile", e.target.files?.[0] || null)}
          />
        </label>
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground"
        data-ocid="admin.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}

export function AdminPage() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const { data: nurses, isLoading: nursesLoading } = useListAllNurses();
  const addNurse = useAddNurse();
  const updateNurse = useUpdateNurse();
  const deleteNurse = useDeleteNurse();

  const [addOpen, setAddOpen] = useState(false);
  const [editNurse, setEditNurse] = useState<Nurse | null>(null);

  const buildNurseFromForm = async (
    form: NurseFormData,
    existingId?: string,
  ): Promise<Nurse> => {
    let profilePhoto: ExternalBlob | undefined = undefined;
    if (form.photoFile) {
      const bytes = new Uint8Array(await form.photoFile.arrayBuffer());
      profilePhoto = ExternalBlob.fromBytes(bytes);
    }
    return {
      id: existingId || uuidv4(),
      name: form.name,
      registrationNumber: form.registrationNumber,
      phone: form.phone,
      village: form.village,
      mandal: form.mandal,
      district: form.district,
      pincode: BigInt(form.pincode),
      experience: BigInt(form.experience || "0"),
      bio: form.bio,
      isAvailable: form.isAvailable,
      profilePhoto,
    };
  };

  const handleAdd = async (form: NurseFormData) => {
    try {
      const nurse = await buildNurseFromForm(form);
      await addNurse.mutateAsync(nurse);
      toast.success("Nurse added successfully!");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add nurse.");
    }
  };

  const handleEdit = async (form: NurseFormData) => {
    if (!editNurse) return;
    try {
      const nurse = await buildNurseFromForm(form, editNurse.id);
      await updateNurse.mutateAsync(nurse);
      toast.success("Nurse updated!");
      setEditNurse(null);
    } catch {
      toast.error("Failed to update nurse.");
    }
  };

  const handleDelete = async (nurseId: string) => {
    try {
      await deleteNurse.mutateAsync(nurseId);
      toast.success("Nurse removed.");
    } catch {
      toast.error("Failed to delete nurse.");
    }
  };

  if (checkingAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="mx-auto animate-spin text-primary" size={32} />
        <p className="mt-3 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="admin.error_state"
      >
        <ShieldAlert size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have admin privileges to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="mt-1 text-muted-foreground">Manage nurse profiles</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-primary text-primary-foreground"
              data-ocid="admin.open_modal_button"
            >
              <Plus size={16} /> Add Nurse
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="admin.dialog"
          >
            <DialogHeader>
              <DialogTitle>Add New Nurse</DialogTitle>
            </DialogHeader>
            <NurseForm
              initial={EMPTY_FORM}
              onSubmit={handleAdd}
              isPending={addNurse.isPending}
              submitLabel="Add Nurse"
            />
          </DialogContent>
        </Dialog>
      </div>

      {nursesLoading ? (
        <div className="space-y-3" data-ocid="admin.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : nurses && nurses.length > 0 ? (
        <div className="space-y-3" data-ocid="admin.table">
          {nurses.map((nurse, i) => {
            const initials = nurse.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const photoUrl = nurse.profilePhoto
              ? nurse.profilePhoto.getDirectURL()
              : "";
            const locationParts = [nurse.village, nurse.mandal, nurse.district]
              .filter(Boolean)
              .join(", ");
            const editForm: NurseFormData = {
              name: nurse.name,
              registrationNumber: nurse.registrationNumber,
              phone: nurse.phone,
              village: nurse.village || "",
              mandal: nurse.mandal || "",
              district: nurse.district || "",
              pincode: nurse.pincode.toString(),
              experience: nurse.experience.toString(),
              bio: nurse.bio,
              isAvailable: nurse.isAvailable,
              photoFile: null,
            };
            return (
              <Card
                key={nurse.id}
                className="card-shadow border-border"
                data-ocid={`admin.item.${i + 1}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage src={photoUrl} alt={nurse.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {nurse.name}
                      </span>
                      <Badge
                        className={
                          nurse.isAvailable
                            ? "bg-accent text-accent-foreground text-xs"
                            : "bg-muted text-muted-foreground text-xs"
                        }
                      >
                        {nurse.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <MapPin size={12} className="shrink-0" />
                      {locationParts
                        ? `${locationParts} — ${nurse.pincode.toString()}`
                        : nurse.pincode.toString()}{" "}
                      &middot; {Number(nurse.experience)} yrs exp
                    </p>
                    {nurse.registrationNumber && (
                      <p className="text-xs text-muted-foreground">
                        Reg: {nurse.registrationNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Dialog
                      open={editNurse?.id === nurse.id}
                      onOpenChange={(o) => !o && setEditNurse(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setEditNurse(nurse)}
                          data-ocid={`admin.edit_button.${i + 1}`}
                        >
                          <Edit size={14} /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-lg max-h-[90vh] overflow-y-auto"
                        data-ocid="admin.dialog"
                      >
                        <DialogHeader>
                          <DialogTitle>Edit {nurse.name}</DialogTitle>
                        </DialogHeader>
                        <NurseForm
                          initial={editForm}
                          onSubmit={handleEdit}
                          isPending={updateNurse.isPending}
                          submitLabel="Save Changes"
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          data-ocid={`admin.delete_button.${i + 1}`}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="admin.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {nurse.name}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The nurse profile will
                            be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="admin.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(nurse.id)}
                            className="bg-destructive text-destructive-foreground"
                            data-ocid="admin.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card
          className="card-shadow border-border"
          data-ocid="admin.empty_state"
        >
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">
              No nurses registered yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Add your first nurse to get started.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="gap-2 bg-primary text-primary-foreground"
              data-ocid="admin.open_modal_button"
            >
              <Plus size={16} /> Add First Nurse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
