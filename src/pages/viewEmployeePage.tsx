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
import { useQualificationApi } from "@/hooks/useQualificationApi";
import type { Qualification } from "@/pages/createEmployeePage";
import type { Employee } from "@/pages/EmployeeTable";

interface ViewEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function ViewEmployeeDialog({
  open,
  onOpenChange,
  employee,
}: ViewEmployeeDialogProps) {
  const { fetchQualifications } = useQualificationApi();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);

  useEffect(() => {
    if (open && employee) {
      fetchQualifications().then((data) => {
        const allQualifications = data || [];
        const employeeQuals = (employee.qualifications || []).map((entry: unknown) => {
          const skillName = typeof entry === 'string' ? entry : (entry as Qualification).skill;
          const qual = allQualifications.find((q: Qualification) => q.skill === skillName);
          return qual || { id: typeof entry === 'string' ? entry : (entry as Qualification).id, skill: skillName };
        });
        setQualifications(employeeQuals);
      });
    }
  }, [open, employee, fetchQualifications]);

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Employee details</DialogTitle>
          <DialogDescription>
            Detailansicht des Mitarbeiters.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vorname</Label>
              <Input value={employee.firstName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Nachname</Label>
              <Input value={employee.lastName} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qualifikationen</Label>
            {qualifications.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {qualifications.map((q) => (
                  <span
                    key={q.id}
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                  >
                    {q.skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Qualifikationen</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Telefonnummer</Label>
            <Input value={employee.phone} readOnly />
          </div>

          <div className="space-y-2">
            <Label>Straße</Label>
            <Input value={employee.street} readOnly />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Postleitzahl</Label>
              <Input value={employee.postcode} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Stadt</Label>
              <Input value={employee.city} readOnly />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}