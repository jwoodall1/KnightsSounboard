import SwiftUI
import MusicKit

struct SoundboardView: View {
    @EnvironmentObject var musicManager: MusicManager
    @State private var searchText = ""
    @State private var searchResults: [Song] = []
    @State private var isSearching = false
    @State private var showingSearchResults = false
    
    // Sample soundboard buttons - you can customize these
    private let soundboardButtons: [SoundboardButton] = [
        SoundboardButton(title: "Victory", emoji: "🏆", searchQuery: "victory music"),
        SoundboardButton(title: "Epic", emoji: "⚔️", searchQuery: "epic battle music"),
        SoundboardButton(title: "Dramatic", emoji: "🎭", searchQuery: "dramatic orchestral"),
        SoundboardButton(title: "Medieval", emoji: "🏰", searchQuery: "medieval fantasy music"),
        SoundboardButton(title: "Adventure", emoji: "🗡️", searchQuery: "adventure theme"),
        SoundboardButton(title: "Mystical", emoji: "✨", searchQuery: "mystical magical music"),
        SoundboardButton(title: "Battle", emoji: "⚔️", searchQuery: "battle theme music"),
        SoundboardButton(title: "Triumph", emoji: "👑", searchQuery: "triumphant music")
    ]
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        VStack(spacing: 20) {
            // Search Bar
            HStack {
                TextField("Search Apple Music...", text: $searchText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .onSubmit {
                        Task {
                            await searchMusic()
                        }
                    }
                
                Button("Search") {
                    Task {
                        await searchMusic()
                    }
                }
                .disabled(searchText.isEmpty || isSearching)
            }
            .padding(.horizontal)
            
            // Search Results
            if showingSearchResults && !searchResults.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Search Results")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            ForEach(searchResults, id: \.id) { song in
                                SongRow(song: song)
                            }
                        }
                        .padding(.horizontal)
                    }
                    .frame(maxHeight: 200)
                }
            }
            
            // Soundboard Grid
            Text("Soundboard")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)
            
            ScrollView {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(soundboardButtons) { button in
                        SoundboardButtonView(button: button)
                    }
                }
                .padding(.horizontal)
            }
            
            // Now Playing Info
            if let currentTrack = musicManager.currentTrack {
                NowPlayingView(song: currentTrack)
            }
        }
    }
    
    private func searchMusic() async {
        guard !searchText.isEmpty else { return }
        
        isSearching = true
        showingSearchResults = true
        
        do {
            searchResults = try await musicManager.searchSongs(query: searchText)
        } catch {
            print("Search failed: \(error)")
        }
        
        isSearching = false
    }
}

struct SoundboardButtonView: View {
    let button: SoundboardButton
    @EnvironmentObject var musicManager: MusicManager
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            if let searchQuery = button.searchQuery {
                Task {
                    let results = try? await musicManager.searchSongs(query: searchQuery)
                    if let firstSong = results?.first {
                        await musicManager.playSong(firstSong)
                    }
                }
            } else if let soundFile = button.localSoundFile {
                musicManager.playSoundboardClip(named: soundFile)
            }
        }) {
            VStack(spacing: 8) {
                Text(button.emoji)
                    .font(.system(size: 40))
                
                Text(button.title)
                    .font(.caption)
                    .fontWeight(.medium)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 120, height: 100)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(isPressed ? Color.blue.opacity(0.3) : Color.blue.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.blue, lineWidth: 2)
                    )
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

struct SongRow: View {
    let song: Song
    @EnvironmentObject var musicManager: MusicManager
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(song.title)
                    .font(.headline)
                    .lineLimit(1)
                
                if let artist = song.artistName {
                    Text(artist)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
            
            Spacer()
            
            Button("Play") {
                Task {
                    await musicManager.playSong(song)
                }
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct NowPlayingView: View {
    let song: Song
    @EnvironmentObject var musicManager: MusicManager
    
    var body: some View {
        VStack(spacing: 8) {
            Text("Now Playing")
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(song.title)
                        .font(.headline)
                        .lineLimit(1)
                    
                    if let artist = song.artistName {
                        Text(artist)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                HStack(spacing: 12) {
                    Button(action: {
                        if musicManager.isPlaying {
                            musicManager.pausePlayback()
                        } else {
                            musicManager.resumePlayback()
                        }
                    }) {
                        Image(systemName: musicManager.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                            .font(.title2)
                    }
                    
                    Button(action: {
                        musicManager.stopPlayback()
                    }) {
                        Image(systemName: "stop.circle.fill")
                            .font(.title2)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

#Preview {
    SoundboardView()
        .environmentObject(MusicManager.shared)
}
