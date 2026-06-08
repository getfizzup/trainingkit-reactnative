import TrainingKit
import Foundation
import UIKit
import React

@objc(TrainingKitModule)
class TrainingKitModule: RCTEventEmitter {
  private var hasListeners = false

  override func supportedEvents() -> [String]! {
    ["TrainingKitWorkoutEvent"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc
  func deviceIdentifier() -> String {
    TrainingKitConfig.deviceId()
  }

  @objc
  func launchClassicWorkout(_ jsonString: String, withToken token: String) {
    guard let data = jsonString.data(using: .utf8) else {
      print("Failed to convert JSON string to Data")
      return
    }

    Task {
      do {
        let controller = try await ReactNativeClassicWorkoutController(data: data, token: token)
        controller.onWorkoutEvent = { [weak self] body in self?.emit(body) }
        await present(controller)
      } catch {
        print("Failed to launch classic workout", error)
      }
    }
  }

  @objc
  func launchVideoWorkout(_ jsonString: String, withToken token: String) {
    guard let data = jsonString.data(using: .utf8) else {
      print("Failed to convert JSON string to Data")
      return
    }

    Task {
      do {
        let controller = try await ReactNativeStreamingWorkoutController(data: data, token: token)
        controller.onWorkoutEvent = { [weak self] body in self?.emit(body) }
        await present(controller)
      } catch {
        print("Failed to launch video workout", error)
      }
    }
  }

  private func emit(_ body: [String: Any]) {
    guard hasListeners else { return }
    sendEvent(withName: "TrainingKitWorkoutEvent", body: body)
  }

  @MainActor
  private func present(_ controller: UIViewController) {
    controller.modalPresentationStyle = .fullScreen

    guard let rootViewController = UIApplication.shared.fzTrainingKitRootViewController else {
      print("Failed to find a root view controller")
      return
    }

    rootViewController.present(controller, animated: true)
  }
}

private extension UIApplication {
  var fzTrainingKitRootViewController: UIViewController? {
    connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first { $0.isKeyWindow }?
      .rootViewController
  }
}
