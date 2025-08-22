// In-memory moderation store (per-instance). Suitable for single-node deployments.

type ServerId = string;
type ProfileId = string;
type Email = string;

class ModerationStore {
  mutedUntilByServer: Map<ServerId, Map<ProfileId, number>> = new Map();
  bannedProfilesByServer: Map<ServerId, Set<ProfileId>> = new Map();
  bannedEmails: Set<Email> = new Set();

  mute(serverId: ServerId, profileId: ProfileId, ms: number) {
    const until = Date.now() + ms;
    const map = this.mutedUntilByServer.get(serverId) || new Map();
    map.set(profileId, until);
    this.mutedUntilByServer.set(serverId, map);
  }

  unmute(serverId: ServerId, profileId: ProfileId) {
    const map = this.mutedUntilByServer.get(serverId);
    if (map) map.delete(profileId);
  }

  isMuted(serverId: ServerId, profileId: ProfileId): boolean {
    const map = this.mutedUntilByServer.get(serverId);
    if (!map) return false;
    const until = map.get(profileId) || 0;
    if (until <= Date.now()) {
      map.delete(profileId);
      return false;
    }
    return true;
  }

  ban(serverId: ServerId, profileId: ProfileId) {
    const set = this.bannedProfilesByServer.get(serverId) || new Set();
    set.add(profileId);
    this.bannedProfilesByServer.set(serverId, set);
  }

  unban(serverId: ServerId, profileId: ProfileId) {
    const set = this.bannedProfilesByServer.get(serverId);
    set?.delete(profileId);
  }

  isBanned(serverId: ServerId, profileId: ProfileId): boolean {
    return this.bannedProfilesByServer.get(serverId)?.has(profileId) || false;
  }

  banEmail(email: Email) {
    this.bannedEmails.add(email.toLowerCase());
  }

  isEmailBanned(email: Email): boolean {
    return this.bannedEmails.has(email.toLowerCase());
  }

  unbanEmail(email: Email) {
    this.bannedEmails.delete(email.toLowerCase());
  }
}

export const moderationStore = new ModerationStore();


