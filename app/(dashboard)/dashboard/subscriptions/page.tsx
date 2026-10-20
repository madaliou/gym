import { SubscriptionsScreen } from "@/components/subscriptions/subscriptions-screen";

type SubscriptionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  return <SubscriptionsScreen searchParams={searchParams} />;
}
