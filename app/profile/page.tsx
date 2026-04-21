import { TopNav } from "@/components/top-nav"
import { BottomNav } from "@/components/bottom-nav"
import { ProfileContent } from "@/components/profile/profile-content"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-8">
        <ProfileContent />
      </main>
      <BottomNav />
    </div>
  )
}
