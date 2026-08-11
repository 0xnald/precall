CREATE UNIQUE INDEX IF NOT EXISTS "thesis_unlocks_tx_hash_idx" ON "thesis_unlocks" ("tx_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "sports_unlocks_tx_hash_unique_idx" ON "sports_unlocks" ("tx_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "circle_actions_tx_hash_unique_idx" ON "circle_actions" ("tx_hash");
