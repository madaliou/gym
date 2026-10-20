import type { SubscriptionStatus } from "@/lib/validations/subscription";

export type SubscriptionListItem = {
  id: string;
  memberId: string;
  memberName: string;
  firstName: string;
  phone: string | null;
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  renewStartDate: string;
};

export type MemberOption = {
  id: string;
  name: string;
};
