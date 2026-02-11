import SwiftUI

// MARK: - Session Step

enum SessionStep: Int, CaseIterable {
    case breathe = 0
    case practice = 1
    case speak = 2
    case reflect = 3

    var label: String {
        switch self {
        case .breathe:  return "Breathe"
        case .practice: return "Practice"
        case .speak:    return "Speak"
        case .reflect:  return "Reflect"
        }
    }

    var icon: String {
        switch self {
        case .breathe:  return "wind"
        case .practice: return "book.fill"
        case .speak:    return "bubble.left.fill"
        case .reflect:  return "heart.fill"
        }
    }

    /// Map a DailyTask type to its session step
    static func step(for taskType: TaskType) -> SessionStep {
        switch taskType {
        case .warmup, .mindfulness:
            return .breathe
        case .exercise, .learn, .fearedWords, .audioLab:
            return .practice
        case .ai, .challenge:
            return .speak
        case .journal:
            return .reflect
        }
    }
}

// MARK: - Session Stepper View

struct SessionStepperView: View {
    let currentTaskType: TaskType
    let completedTaskTypes: Set<TaskType>

    private var activeStep: SessionStep {
        SessionStep.step(for: currentTaskType)
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(SessionStep.allCases, id: \.rawValue) { step in
                let state = stepState(for: step)

                // Step circle + label
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(circleBackground(for: state))
                            .frame(width: 32, height: 32)

                        if state == .completed {
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.obsidianNight)
                        } else {
                            Image(systemName: step.icon)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(iconColor(for: state))
                        }
                    }

                    Text(step.label)
                        .font(.system(size: 10, weight: state == .active ? .bold : .regular))
                        .foregroundColor(labelColor(for: state))
                }
                .frame(maxWidth: .infinity)

                // Connecting line
                if step.rawValue < SessionStep.allCases.count - 1 {
                    Rectangle()
                        .fill(lineState(after: step) ? Color.clarityTeal : Color.elevation2)
                        .frame(height: 2)
                        .frame(maxWidth: 40)
                        .offset(y: -10) // align with circles
                }
            }
        }
        .padding(.horizontal, SLSpacing.s4)
        .padding(.vertical, SLSpacing.s3)
    }

    // MARK: - State Logic

    private enum StepState {
        case completed, active, upcoming
    }

    private func stepState(for step: SessionStep) -> StepState {
        if step == activeStep { return .active }
        if step.rawValue < activeStep.rawValue { return .completed }
        return .upcoming
    }

    private func circleBackground(for state: StepState) -> Color {
        switch state {
        case .completed: return .clarityTeal
        case .active:    return .clarityTeal.opacity(0.15)
        case .upcoming:  return .elevation2
        }
    }

    private func iconColor(for state: StepState) -> Color {
        switch state {
        case .completed: return .obsidianNight
        case .active:    return .clarityTeal
        case .upcoming:  return .textTertiary
        }
    }

    private func labelColor(for state: StepState) -> Color {
        switch state {
        case .completed: return .clarityTeal
        case .active:    return .clarityTeal
        case .upcoming:  return .textTertiary
        }
    }

    private func lineState(after step: SessionStep) -> Bool {
        step.rawValue < activeStep.rawValue
    }
}
