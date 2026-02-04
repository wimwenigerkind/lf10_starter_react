import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useQualificationApi } from "@/hooks/useQualificationApi";
import type { Qualification } from "@/pages/createEmployeePage";
import type { Employee } from "@/pages/EmployeeTable";

export interface EditEmployeeFormData {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  postcode: string;
  city: string;
  qualifications: Qualification[];
}

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: EditEmployeeFormData) => Promise<void>;
  employee: Employee | null;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  onSave,
  employee,
}: EditEmployeeDialogProps) {
  const { fetchQualifications } = useQualificationApi();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [formData, setFormData] = useState<EditEmployeeFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    postcode: "",
    city: "",
    qualifications: [],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        phone: employee.phone,
        street: employee.street,
        postcode: employee.postcode,
        city: employee.city,
        qualifications: [],
      });

      fetchQualifications().then((data) => {
        const allQualifications = data || [];
        setQualifications(allQualifications);

        const employeeQuals = employee.qualifications.map((entry: unknown) => {
          const skillName = typeof entry === 'string' ? entry : (entry as Qualification).skill;
          const qual = allQualifications.find((q: Qualification) => q.skill === skillName);
          return qual || { id: typeof entry === 'string' ? entry : (entry as Qualification).id, skill: skillName };
        });

        setFormData(prev => ({ ...prev, qualifications: employeeQuals }));
      });
    }
  }, [open, employee, fetchQualifications]);

  const handleInputChange = (field: keyof EditEmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleQualificationToggle = (qualification: Qualification) => {
    setFormData((prev) => {
      const isSelected = prev.qualifications.some((q) => q.id === qualification.id);
      if (isSelected) {
        return {
          ...prev,
          qualifications: prev.qualifications.filter((q) => q.id !== qualification.id),
        };
      } else {
        return {
          ...prev,
          qualifications: [...prev.qualifications, qualification],
        };
      }
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];

    if (!formData.firstName.trim()) {
      validationErrors.push("Vorname ist erforderlich");
    }

    if (!formData.lastName.trim()) {
      validationErrors.push("Nachname ist erforderlich");
    }

    if (!formData.phone.trim()) {
      validationErrors.push("Telefonnummer ist erforderlich");
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      validationErrors.push("Ungültige Telefonnummer");
    }

    if (!formData.street.trim()) {
      validationErrors.push("Straße ist erforderlich");
    }

    if (!formData.postcode.trim()) {
      validationErrors.push("Postleitzahl ist erforderlich");
    } else if (!/^\d{5}$/.test(formData.postcode)) {
      validationErrors.push("Postleitzahl muss 5 Ziffern enthalten");
    }

    if (!formData.city.trim()) {
      validationErrors.push("Stadt ist erforderlich");
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !employee) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      setErrors([err instanceof Error ? err.message : "Fehler beim Aktualisieren des Mitarbeiters"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit employee</DialogTitle>
          <DialogDescription>
            Bearbeiten Sie die Mitarbeiterdaten.
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Max"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Mustermann"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qualifikationen</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formData.qualifications.length > 0
                    ? `${formData.qualifications.length} ausgewählt`
                    : "Qualifikationen auswählen"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[450px]">
                {qualifications.map((qualification) => (
                  <DropdownMenuCheckboxItem
                    key={qualification.id}
                    checked={formData.qualifications.some((q) => q.id === qualification.id)}
                    onCheckedChange={() => handleQualificationToggle(qualification)}
                  >
                    {qualification.skill}
                  </DropdownMenuCheckboxItem>
                ))}
                {qualifications.length === 0 && (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Keine Qualifikationen verfügbar
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {formData.qualifications.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.qualifications.map((q) => (
                  <span
                    key={q.id}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                  >
                    {q.skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+49 123 456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Straße *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleInputChange("street", e.target.value)}
              placeholder="Musterstraße 123"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postleitzahl *</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange("postcode", e.target.value)}
                placeholder="12345"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Musterstadt"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Save..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
