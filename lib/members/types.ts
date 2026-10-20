import type { UpdateMemberFormValues } from "@/lib/validations/member";

export type MemberEditable = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: UpdateMemberFormValues["gender"];
  dateOfBirth: string;
  photoUrl: string | null;
  address: string;
  notes: string;
  joinedAt: string;
};
