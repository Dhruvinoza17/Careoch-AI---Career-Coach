import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCoverLetters } from "@/actions/cover-letter";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterIndexPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="container mx-auto py-6 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-6xl font-bold gradient-title">Cover Letters</h1>
        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}