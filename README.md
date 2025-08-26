# pacman_v1.0.2
A browser-based Pacman game implemented in JavaScript with smooth animation, AI ghosts, and classic gameplay.

To Do:
- Add a main menu to play the game
- Ghost staggering when they are intending to overlap
- Change game over screen from reset to "Game Over" overlay with click to restart prompt
- Change map logic to something that will allow multiple maps
- Add Levels with map variety

Pacman 1.0.1 - Initial Release
- Basic Pacman gameplay:
    - Move Pacman with arrow keys/WASD.
    - Collect pellets to increase score.
    - Avoid ghosts; losing all lives resets the game.
- Static map layout with walls, pellets, and ghosts.
- No tunnel wrapping or win condition logic.
- No winner screen or restart prompt.
- Press "Escape" to pause the game

Pacman Patch 1.0.2 - Tunnel, Win Condition, Pathin Fixes
- Tunnel Wrap Logic:
    - Pacman now wraps correctly between the left and right tunnels on row 11 (columns 0 and 21), matching classic Pacman behavior.
- Game Win Condition:
    - When all pellets are cleared, a “WINNER!” overlay appears.
    - Added a clickable “Click to Restart” prompt to easily replay after winning.
- Map and Pathing Fixes:
    - Adjusted map data to improve pathing for Pacman and ghosts.
    - Ensured tunnel entrances and exits are properly aligned for smooth movement.
- Bug Fixes & Improvements:
    - Prevented unintended wrapping or wall placement during tunnel transitions.
    - Game loop and UI improvements for a smoother experience.

Pacman Patch 1.0.3 - Ghost Pathing Fixes
- Removed redundant notes from code
- Adjusted ghost pathing logic to prevent unintended wrapping or wall placement during tunnel transitions
- Added stuck counter to ghosts to prevent them from getting stuck in walls