export type EmailDelivery =
  | { status: "sent" }
  | { status: "skipped"; reason: "not_configured" | "missing_recipient" }
  | { status: "failed" };
