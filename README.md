# Gmail Progress Bar Extension

A Chrome extension that adds a sleek progress bar to Gmail conversations, helping you track your position while reading through email threads.

## Features

- Clean and minimal progress bar that matches Gmail's design
- Automatically appears only in email threads
- Updates smoothly as you scroll through conversations
- Integrates seamlessly with Gmail's interface
- Lightweight with minimal performance impact
- Works with expanded/collapsed emails

## How it Works

The extension adds a thin progress bar at the top of Gmail threads that:
- Mirrors the scroll position of the conversation
- Shows your current position in the thread
- Updates in real-time as you scroll
- Automatically appears/disappears when entering/leaving threads

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will automatically activate when you visit Gmail

## Technical Details

The extension uses:
- MutationObserver to detect thread navigation
- Scroll event listeners to track reading progress
- Gmail's native scroll container for accurate position tracking
- Clean ES6+ JavaScript with no external dependencies

## Files

- `manifest.json`: Extension configuration and permissions
- `content.js`: Core functionality for progress tracking
- `styles.css`: Minimal CSS for the progress bar

## Requirements

- Google Chrome browser
- Gmail account

## Notes

- The extension only activates on mail.google.com
- Requires minimal permissions (only access to Gmail)
- Designed to be lightweight and non-intrusive
