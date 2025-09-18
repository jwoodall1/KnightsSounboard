import Foundation
import MusicKit
import AVFoundation

@MainActor
class MusicManager: ObservableObject {
    static let shared = MusicManager()
    
    @Published var authorizationStatus: MusicAuthorization.Status = .notDetermined
    @Published var isPlaying = false
    @Published var currentTrack: Song?
    @Published var playbackState: MusicPlayer.PlaybackState = .stopped
    
    private let musicPlayer = SystemMusicPlayer.shared
    private var audioEngine: AVAudioEngine?
    private var audioPlayer: AVAudioPlayer?
    
    private init() {
        setupAudioSession()
        updateAuthorizationStatus()
    }
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    private func updateAuthorizationStatus() {
        authorizationStatus = MusicAuthorization.currentStatus
    }
    
    func requestAuthorization() async {
        do {
            let status = try await MusicAuthorization.request()
            authorizationStatus = status
        } catch {
            print("Music authorization failed: \(error)")
        }
    }
    
    func searchSongs(query: String) async throws -> [Song] {
        let request = MusicCatalogSearchRequest(term: query, types: [Song.self])
        let response = try await request.response()
        return response.songs
    }
    
    func playSong(_ song: Song) async {
        do {
            musicPlayer.queue = [song]
            try await musicPlayer.play()
            currentTrack = song
            isPlaying = true
        } catch {
            print("Failed to play song: \(error)")
        }
    }
    
    func playSoundboardClip(named clipName: String) {
        // For soundboard clips, we'll use local audio files
        // This is a placeholder - you would add your own sound files
        guard let url = Bundle.main.url(forResource: clipName, withExtension: "mp3") else {
            print("Sound file not found: \(clipName)")
            return
        }
        
        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.play()
        } catch {
            print("Failed to play sound clip: \(error)")
        }
    }
    
    func pausePlayback() {
        musicPlayer.pause()
        isPlaying = false
    }
    
    func resumePlayback() {
        Task {
            try await musicPlayer.play()
            isPlaying = true
        }
    }
    
    func stopPlayback() {
        musicPlayer.stop()
        isPlaying = false
        currentTrack = nil
    }
}

// MARK: - Soundboard Data Model
struct SoundboardButton: Identifiable {
    let id = UUID()
    let title: String
    let emoji: String
    let searchQuery: String?
    let localSoundFile: String?
    
    init(title: String, emoji: String, searchQuery: String? = nil, localSoundFile: String? = nil) {
        self.title = title
        self.emoji = emoji
        self.searchQuery = searchQuery
        self.localSoundFile = localSoundFile
    }
}
