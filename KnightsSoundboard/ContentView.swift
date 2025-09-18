import SwiftUI
import MusicKit

struct ContentView: View {
    @EnvironmentObject var musicManager: MusicManager
    @State private var showingSearch = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 8) {
                    Text("Knights Soundboard")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Tap to play Apple Music clips")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top)
                
                // Music Authorization Status
                VStack(spacing: 12) {
                    if musicManager.authorizationStatus == .authorized {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Apple Music Connected")
                                .font(.headline)
                        }
                    } else {
                        VStack(spacing: 8) {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(.orange)
                                Text("Apple Music Access Required")
                                    .font(.headline)
                            }
                            
                            Button("Authorize Apple Music") {
                                Task {
                                    await musicManager.requestAuthorization()
                                }
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Soundboard Grid
                if musicManager.authorizationStatus == .authorized {
                    SoundboardView()
                }
                
                Spacer()
            }
            .padding()
            .navigationBarHidden(true)
        }
        .task {
            await musicManager.requestAuthorization()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(MusicManager.shared)
}
