# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a LIFF (LINE Front-end Framework) application featuring a 1-minute face-clicking game.

## Game Specifications
- Duration: 60 seconds
- Click faces that appear randomly on screen to score points
- 6 types of faces with different point values and behaviors
- Faces move around with collision detection
- Special faces (devil/angel) appear at 30s and 50s marks

## Face Types & Scoring
1. Happy Face (😊): +10 points, 2s display
2. Normal Face (😐): +5 points, 2s display  
3. Sad Face (😢): +2 points, 2s display
4. Angry Face (😠): -10 points, 2s display
5. Devil Face (😈): halves total score, 5s display
6. Angel Face (😇): doubles total score, 1s display

## Technical Requirements
- HTML5 Canvas for game rendering
- Vanilla JavaScript (no frameworks)
- LIFF SDK integration for LINE features
- Responsive design for mobile devices
- Collision detection for moving faces
- Score management and timer functionality

## Code Style Guidelines
- Use ES6+ syntax
- Modular code structure
- Clear variable naming
- Comprehensive comments for game logic
- Mobile-first responsive design
