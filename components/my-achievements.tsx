import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Trophy, Star, Languages } from "lucide-react"
import { personalAchievements } from "@/lib/profile-data"

// Map of icon strings to Lucide components
const iconMap = {
  trophy: <Trophy className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
  languages: <Languages className="h-6 w-6" />,
} as const;

export default function MyAchievements() {
  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono">
      <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">My Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className="bg-gray-900 border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-green-400">{achievement.title}</CardTitle>
                <CardDescription className="text-green-300/80 whitespace-pre-line mt-1 text-base">
                  {achievement.description.split('\n')[0]}
                  {achievement.description.split('\n').length > 1 && (
                    <span className="block mt-2 text-sm text-green-300/60">
                      {achievement.description.split('\n').slice(1).join('\n')}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-green-500/20">{iconMap[achievement.icon]}</div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <span className="text-green-300/70">{achievement.year}</span>
                <Badge variant="outline" className="border-green-500 text-green-400">
                  {achievement.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

