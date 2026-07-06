function buildLeaderboard(store, limit = 10) {
  return store
    .allPlayers()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((player, index) => ({
      rank: index + 1,
      userId: player.id,
      username: player.username,
      score: player.score,
      updatedAt: new Date().toISOString()
    }));
}

function findRank(store, userId, scanLimit = 100) {
  const board = buildLeaderboard(store, scanLimit);
  const idx = board.findIndex((row) => row.userId === userId);
  return idx >= 0 ? idx + 1 : board.length + 1;
}

module.exports = { buildLeaderboard, findRank };
