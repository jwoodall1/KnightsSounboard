import SwiftUI
import MusicKit

@main
struct KnightsSoundboardApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(MusicManager.shared)
        }
    }
}
