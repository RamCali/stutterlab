import WidgetKit
import SwiftUI

struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let message: String
}

struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: Date(), streak: 0, message: "Daily practice")
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(StreakEntry(date: Date(), streak: UserDefaults.standard.integer(forKey: "currentStreak"), message: "Today's rep counts"))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let streak = UserDefaults.standard.integer(forKey: "currentStreak")
        let entry = StreakEntry(date: Date(), streak: streak, message: "Open StutterLab for today's practice")
        let next = Calendar.current.date(byAdding: .hour, value: 4, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct StreakWidgetView: View {
    var entry: StreakEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                Text("\(entry.streak)")
                    .font(.title2.bold())
            }
            Text(entry.message)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding()
    }
}

struct StreakWidget: Widget {
    let kind = "StreakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakProvider()) { entry in
            StreakWidgetView(entry: entry)
        }
        .configurationDisplayName("StutterLab Streak")
        .description("Your practice streak at a glance.")
        .supportedFamilies([.systemSmall, .accessoryRectangular])
    }
}

@main
struct StutterLabWidgetBundle: WidgetBundle {
    var body: some Widget {
        StreakWidget()
    }
}
