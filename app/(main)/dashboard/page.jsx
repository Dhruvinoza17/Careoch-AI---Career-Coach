import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import Layout from "./_components/layout";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {

  // Check if user is already onboarded 
  const { isOnboarded } = await getUserOnboardingStatus();
  const insights = await getIndustryInsights();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <DashboardView insights={insights} />
      </div>
    </Layout>
  )
}

export default IndustryInsightsPage;