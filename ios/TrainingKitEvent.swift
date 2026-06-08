import Foundation
import TrainingKit

/// Helpers that turn TrainingKit values into the JSON-friendly event bodies sent
/// over the React Native event emitter.
enum TrainingKitEvent {
  /// Encodes a `SaveWorkoutState` (Codable) into a JSON string, or `"{}"`.
  static func encode(_ state: SaveWorkoutState) -> String {
    guard
      let data = try? JSONEncoder().encode(state),
      let json = String(data: data, encoding: .utf8)
    else {
      return "{}"
    }
    return json
  }

  /// Builds the body for an analytics `event`.
  static func event(_ name: Tracking.Event, _ properties: [Tracking.Property: String]?) -> [String: Any] {
    var props: [String: String] = [:]
    properties?.forEach { props[$0.key.rawValue] = $0.value }

    let propsJson: String
    if
      let data = try? JSONSerialization.data(withJSONObject: props),
      let json = String(data: data, encoding: .utf8)
    {
      propsJson = json
    } else {
      propsJson = "{}"
    }

    return ["type": "event", "name": name.rawValue, "properties": propsJson]
  }
}
