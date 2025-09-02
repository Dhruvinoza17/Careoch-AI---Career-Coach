import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

const ResumePage = async () => {
  // Check if user is already onboarded 
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Build Your Resume</h1>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Resume Builder</h2>
          <p className="text-muted-foreground mb-4">
            Create a professional resume tailored to your industry and experience level.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Our AI-powered resume builder is currently under development. 
                This feature will help you create professional resumes optimized for ATS systems.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Features in Development</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI-powered content suggestions</li>
                <li>• Industry-specific templates</li>
                <li>• ATS optimization</li>
                <li>• Real-time feedback</li>
                <li>• Multiple format exports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResumePage;
