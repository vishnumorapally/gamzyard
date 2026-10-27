# 🎮 Gamzyard | Ultimate Multiplayer & Bot Arcade

Gamzyard is a modern, responsive web gaming platform featuring 5 games, each equipped with 3 game modes: **Play with Bot (AI)**, **Create Room & Invite Friend**, and **Online Matchmaking**.

---

## 🕹️ Games Included

1. **Chess Master**
   - Full 8x8 chess with legal move indicators, checks, checkmates, captured pieces rack.
   - Built-in AI with Easy, Medium, and Master evaluation depths.
2. **Connect Four**
   - 7x6 drop grid with gravity animation, disc highlights, and 4-in-a-row detection.
   - Heuristic AI with defensive blocking and center control.
3. **Neon Tic-Tac-Toe**
   - 3x3 fast-paced cyberpunk duel with radiant animations and winning streak glow.
   - Unbeatable Minimax AI mode.
4. **Classic Checkers**
   - 8x8 checkers with diagonal moves, multi-jump captures, and King promotions (👑).
   - Smart AI prioritizing jumps and kinging.
5. **Naval Battleship**
   - 10x10 dual-radar fleet warfare with Carrier, Battleship, Cruiser, Submarine, and Destroyer.
   - 1-click Auto-Deploy Fleet for instant mobile setup.
   - Hunt & Target AI algorithm for tactical naval combat.

---

## 🚀 Game Modes (Available in Every Game)

- 🤖 **Play with Bot**: Single-player vs AI with selectable difficulties (**Casual**, **Tactical**, **Master**).
- 👥 **Create Room & Invite Friend**: Generates a private 6-character room code and 1-click shareable URL (`?room=XYZ`). Once your friend joins, game begins in real time!
- 🌐 **Match Online**: Live matchmaking queue auto-pairing players searching for the same game. Includes quick-test challenger practice.

---

## 💎 Platform Features

- **📱 100% Mobile & Touch Friendly**: Custom touch controls, compact layouts, and responsive grids.
- **🔊 Procedural Audio FX**: Zero-latency Web Audio API sound synthesizer (no broken files, instant offline sound effects with mute toggle).
- **👤 Player Profiles & Avatars**: Play as Guest or customize your gamer name and select from 12 avatars.
- **📊 Career Record Tracking**: Win, Loss, Draw, and Win Rate % tracking.
- **💬 Real-Time In-Game Chat**: Quick reaction emojis (🔥, 👏, 🧠, 😮, 🤝, 💀) and live text chat in multiplayer rooms.

---

## 💻 Local Testing Link

The application is running live:

👉 **Localhost Link**: `http://localhost:5000`

---

## 🌐 Deploying to Render (When Ready)

Gamzyard is pre-configured for **Render**:
1. Push this project to GitHub.
2. On [Render.com](https://render.com), click **New +** -> **Web Service**.
3. Select your repository.
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. Render will automatically build the frontend and serve both the static web app and Socket.io server on your public Render domain!
