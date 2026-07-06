const SEED_NAMES = ['Minh', 'Lan', 'Huy', 'Trang', 'Duc', 'Mai', 'Khoa', 'Linh', 'Nam', 'Anh'];

class PlayerStore {
  constructor() {
    this.players = new Map();
    this.pendingActions = new Map();
  }

  static createSeed(password = 'pass123') {
    const store = new PlayerStore();
    SEED_NAMES.forEach((username, index) => {
      const id = `player-${index + 1}`;
      store.players.set(id, {
        id,
        username,
        password,
        score: (index + 1) * 137 % 1000,
        totalActions: index * 3
      });
    });
    return store;
  }

  findByUsername(username) {
    for (const player of this.players.values()) {
      if (player.username === username) return player;
    }
    return null;
  }

  getById(id) {
    return this.players.get(id);
  }

  allPlayers() {
    return Array.from(this.players.values());
  }

  saveAction(actionId, record) {
    this.pendingActions.set(actionId, record);
  }

  getAction(actionId) {
    return this.pendingActions.get(actionId);
  }

  markActionUsed(actionId) {
    const record = this.pendingActions.get(actionId);
    if (record) record.used = true;
  }
}

module.exports = { PlayerStore };
