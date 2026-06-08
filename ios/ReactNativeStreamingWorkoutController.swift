import Combine
import CoreMedia
import TrainingKit
import UIKit

class ReactNativeStreamingWorkoutController: StreamingWorkoutController {
  /// Forwards workout lifecycle events to the React Native bridge.
  var onWorkoutEvent: (([String: Any]) -> Void)?

  var saveProm: AnyPublisher<Void, Never>?
  private var subscriptions = Set<AnyCancellable>()
  private var didSave = false

  override func saveSession(state: SaveWorkoutState) {
    super.saveSession(state: state)

    didSave = true
    onWorkoutEvent?(["type": "save", "data": TrainingKitEvent.encode(state)])

    saveProm = Future<Void, Never> { promise in
      DispatchQueue.main.asyncAfter(deadline: .now() + 5) {
        promise(.success(()))
      }
    }.eraseToAnyPublisher()
  }

  override func quitWorkout() {
    if !didSave {
      onWorkoutEvent?(["type": "quit"])
    }
    super.quitWorkout()
  }

  override func trackEvent(_ name: Tracking.Event, properties: [Tracking.Property: String]? = nil) {
    onWorkoutEvent?(TrainingKitEvent.event(name, properties))
    super.trackEvent(name, properties: properties)
  }

  override func displayPostWorkout() -> AnyPublisher<Void, Never> {
    if let saveProm {
      saveProm.sink { [weak self] _ in
        self?.quitWorkout()
      }.store(in: &subscriptions)

      return saveProm
    }

    return super.displayPostWorkout()
  }

  override func log(_ message: String, context _: [String: AnyHashable]? = nil) {
    print(message)
  }
}
