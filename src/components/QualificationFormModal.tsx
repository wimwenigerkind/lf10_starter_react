import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface QualificationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id?: string; skill: string }) => void;
  initialData?: { id?: string; skill: string } | null;
  loading?: boolean;
}

export function QualificationFormModal({ open, onClose, onSubmit, initialData, loading }: QualificationFormModalProps) {
  const [skill, setSkill] = useState("");

  useEffect(() => {
    setSkill(initialData?.skill || "");
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: initialData?.id, skill });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Qualification" : "Create Qualification"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter skill"
            value={skill}
            onChange={e => setSkill(e.target.value)}
            required
            autoFocus
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !skill.trim()}>
              {loading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
