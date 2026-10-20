import { ExpiringSubscriptionsScreen } from "@/components/subscriptions/expiring-subscriptions-screen";

type ExpiringSubscriptionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ExpiringSubscriptionsPage({ searchParams }: ExpiringSubscriptionsPageProps) {
  return <ExpiringSubscriptionsScreen searchParams={searchParams} />;
}
