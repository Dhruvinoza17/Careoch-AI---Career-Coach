import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import Layout from "./_components/layout";
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_components/dashboard-view";

const IndustryInsightsPage = async () => {
  // Check if user is already onboarded first
  const { isOnboarded } = await getUserOnboardingStatus();
  
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  try {
    const insights = await getIndustryInsights();

    return (
      <Layout>
        <div className="container mx-auto">
          <DashboardView insights={insights} />
        </div>
      </Layout>
    )
  } catch (error) {
    console.error("Error in IndustryInsightsPage:", error);
    return (
      <Layout>
        <div className="container mx-auto">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-muted-foreground">
              Unable to load dashboard data. Please check your configuration and try again.
            </p>
          </div>
        </div>
      </Layout>
    )
  }
}

export default IndustryInsightsPage;