import Foundation

// MARK: - Week Layer Model (ported from src/lib/curriculum/weeks.ts)

struct WeekInfo {
    let weekNumber: Int
    let startDay: Int
    let endDay: Int
    let phase: Int
    let phaseLabel: String
    let title: String
    let milestone: String
}

struct DayInfo: Identifiable {
    var id: Int { dayNumber }
    let dayNumber: Int
    let weekNumber: Int
    let dayOfWeek: Int
    let title: String
    let isCompleted: Bool
    let isCurrent: Bool
    let isLocked: Bool
    let taskCount: Int
}

struct MilestoneInfo {
    enum MilestoneType { case week, phase }
    let type: MilestoneType
    let label: String
    let daysUntil: Int
}

// MARK: - Week Data

enum WeekData {

    static let titles: [Int: String] = [
        1: "Getting Started",
        2: "Building Your Foundation",
        3: "New Techniques",
        4: "Finding Your Flow",
        5: "Combining Skills",
        6: "Deepening Practice",
        7: "Advanced Techniques",
        8: "Facing the Real World",
        9: "Confidence in Action",
        10: "Pushing Boundaries",
        11: "Mastery Begins",
        12: "Strengthening Gains",
        13: "Graduation",
    ]

    static let milestones: [Int: String] = [
        1: "Breathing mastered, gentle onset introduced",
        2: "Foundation checkpoint — ready for new techniques",
        3: "Light contact & prolonged speech unlocked",
        4: "FAF introduced, building blocks solidifying",
        5: "Cancellation & pull-out techniques learned",
        6: "Preparatory set & voluntary stuttering practiced",
        7: "All core techniques integrated",
        8: "First AI conversation completed",
        9: "Phone simulation conquered",
        10: "Feared words practice underway",
        11: "Advanced scenarios with confidence",
        12: "Community engagement & independence",
        13: "Program complete — maintenance mode unlocked",
    ]

    /// Week number for a given day (1-13 for days 1-90, 14 for 91+)
    static func weekForDay(_ day: Int) -> Int {
        if day <= 0 { return 1 }
        if day > 90 { return 14 }
        return Int(ceil(Double(day) / 7.0))
    }

    /// Phase number for the midpoint of a week
    private static func phaseForWeek(_ weekNumber: Int) -> Int {
        let midDay = min((weekNumber - 1) * 7 + 4, 90)
        return PhaseInfo.phase(for: midDay)
    }

    /// Info for a specific week
    static func weekInfo(_ weekNumber: Int) -> WeekInfo {
        let startDay = (weekNumber - 1) * 7 + 1
        let endDay = weekNumber == 13 ? 90 : weekNumber * 7
        let phase = phaseForWeek(weekNumber)

        return WeekInfo(
            weekNumber: weekNumber,
            startDay: startDay,
            endDay: endDay,
            phase: phase,
            phaseLabel: PhaseInfo.labels[phase] ?? "Maintenance",
            title: titles[weekNumber] ?? "Week \(weekNumber)",
            milestone: milestones[weekNumber] ?? ""
        )
    }

    /// Day details for a week, with completion state relative to currentDay
    static func daysForWeek(_ weekNumber: Int, currentDay: Int) -> [DayInfo] {
        let startDay = (weekNumber - 1) * 7 + 1
        let endDay = weekNumber == 13 ? 90 : weekNumber * 7
        var days: [DayInfo] = []

        for d in startDay...endDay {
            let plan = DailyPlanGenerator.plan(for: d)
            days.append(DayInfo(
                dayNumber: d,
                weekNumber: weekNumber,
                dayOfWeek: d - startDay,
                title: plan?.title ?? "Day \(d)",
                isCompleted: d < currentDay,
                isCurrent: d == currentDay,
                isLocked: d > currentDay,
                taskCount: plan?.tasks.count ?? 0
            ))
        }

        return days
    }

    /// All 13 weeks
    static func allWeeks() -> [WeekInfo] {
        (1...13).map { weekInfo($0) }
    }

    /// Next milestone from current day
    static func nextMilestone(currentDay: Int) -> MilestoneInfo? {
        guard currentDay <= 90 else { return nil }

        let currentWeek = weekForDay(currentDay)
        let info = weekInfo(currentWeek)
        let daysUntilWeekEnd = info.endDay - currentDay + 1

        // Check if a phase transition happens before end of week
        let currentPhase = PhaseInfo.phase(for: currentDay)
        for d in (currentDay + 1)...info.endDay {
            if PhaseInfo.phase(for: d) != currentPhase {
                let nextPhase = currentPhase + 1
                let nextLabel = PhaseInfo.labels[nextPhase] ?? "Next Phase"
                return MilestoneInfo(
                    type: .phase,
                    label: "Phase \(nextPhase): \(nextLabel) begins",
                    daysUntil: d - currentDay
                )
            }
        }

        return MilestoneInfo(
            type: .week,
            label: info.milestone,
            daysUntil: daysUntilWeekEnd
        )
    }
}
