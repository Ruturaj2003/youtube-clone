import { SubscriptionsSection2 } from "../sections/subscriptions-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Catgories Section => categoirse Id*/}
      <div className="">
        <h1 className="text-2xl font-bold">All Subscriptions</h1>

        <p className="text-xs text-muted-foreground">
          View and manage all your subscriptions{" "}
        </p>
      </div>

      <SubscriptionsSection2 />
    </div>
  );
};
