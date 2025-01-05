# Gmail Progress Bar Extension

A Chrome extension that enhances Gmail by adding a visual progress bar to email conversations, helping users track their position within email threads.

## Features

- Visual progress bar showing current position in email threads
- Email count indicator (e.g., "Email 3 of 10")
- Seamless integration with Gmail's interface
- Real-time updates as you scroll through conversations
- Lightweight and performant

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will automatically activate when you visit Gmail

## Usage

1. Open Gmail in Chrome
2. Navigate to any email conversation with multiple messages
3. A progress bar will appear at the top of the page
4. As you scroll through the conversation, the progress bar and count will update automatically

## Development

The extension consists of three main files:
- `manifest.json`: Extension configuration
- `content.js`: Core functionality for tracking and displaying progress
- `styles.css`: Styling for the progress bar

## Requirements

- Google Chrome browser
- Gmail account

## Notes

- The extension only activates on mail.google.com
- Requires "activeTab" permission to function
- Compatible with the latest version of Chrome and Gmail's interface
