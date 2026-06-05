import TrainingKit
import Foundation
import UIKit

@objc(TrainingKitModule)
class TrainingKitModule: NSObject {
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
        await present(controller)
      } catch {
        print("Failed to launch video workout", error)
      }
    }
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
