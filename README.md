# Knights Soundboard

A Swift-based soundboard app that integrates with Apple Music using MusicKit to play music clips and sound effects.

## Features

- 🎵 **Apple Music Integration**: Search and play music directly from Apple Music
- 🎮 **Interactive Soundboard**: Tap buttons to play themed music clips
- 🔍 **Music Search**: Search for specific songs or artists
- 🎚️ **Playback Controls**: Play, pause, and stop music playback
- 📱 **Modern UI**: Clean, intuitive interface built with SwiftUI
- 🎯 **Customizable**: Easy to add your own soundboard buttons and themes

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Apple Music subscription (for full functionality)
- Valid Apple Developer account (for device testing)

## Setup Instructions

### 1. Open the Project

1. Open `KnightsSoundboard.xcodeproj` in Xcode
2. Select your development team in the project settings
3. Update the bundle identifier if needed

### 2. Configure Apple Music Access

The app is already configured with the necessary permissions in `Info.plist`:
- `NSAppleMusicUsageDescription`: "This app needs access to Apple Music to play soundboard clips and music."

### 3. Add MusicKit Framework

1. In Xcode, select your project in the navigator
2. Go to the target's "Frameworks, Libraries, and Embedded Content" section
3. Click the "+" button and add "MusicKit.framework"

### 4. Customize Soundboard Buttons

Edit the `soundboardButtons` array in `SoundboardView.swift` to add your own themed buttons:

```swift
private let soundboardButtons: [SoundboardButton] = [
    SoundboardButton(title: "Victory", emoji: "🏆", searchQuery: "victory music"),
    SoundboardButton(title: "Epic", emoji: "⚔️", searchQuery: "epic battle music"),
    // Add your own buttons here
]
```

### 5. Add Local Sound Files (Optional)

To add local sound files for instant playback:

1. Add your `.mp3` or `.wav` files to the Xcode project
2. Update the soundboard buttons to use local files:

```swift
SoundboardButton(title: "Custom Sound", emoji: "🎵", localSoundFile: "your_sound_file")
```

## Project Structure

```
KnightsSoundboard/
├── KnightsSoundboardApp.swift      # Main app entry point
├── ContentView.swift               # Main view with authorization
├── SoundboardView.swift           # Soundboard interface
├── MusicManager.swift             # MusicKit integration and audio management
├── Info.plist                     # App permissions and configuration
└── Assets.xcassets/               # App icons and assets
```

## Key Components

### MusicManager
- Handles Apple Music authorization
- Manages music playback and search
- Provides audio session management
- Singleton pattern for app-wide access

### SoundboardView
- Grid layout of themed music buttons
- Search functionality for Apple Music
- Now playing display
- Interactive button animations

### SoundboardButton
- Data model for soundboard buttons
- Supports both Apple Music search and local audio files
- Customizable titles and emojis

## Usage

1. **First Launch**: The app will request Apple Music authorization
2. **Search Music**: Use the search bar to find specific songs
3. **Soundboard**: Tap themed buttons to play related music
4. **Playback Control**: Use the now playing section to control playback

## Customization

### Adding New Themes
1. Create new `SoundboardButton` instances with appropriate search queries
2. Choose relevant emojis and titles
3. Add to the `soundboardButtons` array

### Styling
- Modify colors and layouts in the SwiftUI views
- Update button styles in `SoundboardButtonView`
- Customize the overall theme in `ContentView`

### Audio Management
- Extend `MusicManager` for additional audio features
- Add support for different audio formats
- Implement audio effects or filters

## Troubleshooting

### Apple Music Not Working
- Ensure you have an active Apple Music subscription
- Check that MusicKit is properly linked in Xcode
- Verify the app has music permissions in Settings

### Build Issues
- Make sure you're using iOS 17.0+ as the deployment target
- Verify MusicKit framework is added to the project
- Check that all Swift files are included in the target

### Audio Playback Issues
- Ensure the device volume is up
- Check that other audio apps aren't interfering
- Verify the audio session is properly configured

## Future Enhancements

- [ ] Playlist creation and management
- [ ] Custom sound recording
- [ ] Sound effects library
- [ ] Social sharing features
- [ ] Offline mode with cached music
- [ ] Advanced audio controls (EQ, effects)
- [ ] Multiple soundboard themes
- [ ] Voice commands integration

## License

This project is available for personal and educational use. Please ensure you comply with Apple's MusicKit terms of service when using Apple Music features.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Apple's MusicKit documentation
3. Ensure your development environment is properly configured

---

**Note**: This app requires an Apple Music subscription to access the full music library. Some features may be limited without a subscription.
