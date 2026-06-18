/**
 * PHASE 4: Edge Distribution & Sub-1ms Networking
 * Specialized utilities for real-time multiplayer synchronization and NTP clock correction.
 */

/**
 * FEATURE: NTP Synchronization (expert)
 * Calculates the offset between client and server time to ensure fair tournament starts.
 * In production, this would call a high-precision NTP server.
 */
import { isFeatureEnabled } from './featureFlags.js';

/**
 * FEATURE: NTP Synchronization (expert)
 * Calculates the offset between client and server time to ensure fair tournament starts.
 * In production, this would call a high-precision NTP server.
 * 
 * @returns {Promise<number>} - The time offset in milliseconds.
 */
export const syncNetworkTime = async () => {
    // Only perform advanced sync if hardware/crypto layers are active (part of the secure stack)
    if (!isFeatureEnabled('ENHANCED_HARDWARE_DETECTION')) {
        return 0;
    }

    const start = performance.now();
    try {
        // Simplified NTP sync using a fast worldtime API for demo
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        const end = performance.now();
        const rtt = end - start;
        const serverTime = new Date(data.utc_datetime).getTime();
        const clientTime = Date.now();

        // Offset = (ServerTime + RTT/2) - ClientTime
        const offset = (serverTime + (rtt / 2)) - clientTime;

        console.log(`[NTP] Network Offset: ${offset.toFixed(2)}ms, RTT: ${rtt.toFixed(2)}ms`);
        return offset;
    } catch (e) {
        console.warn('[NTP] Sync failed, using zero offset.');
        return 0;
    }
};

/**
 * FEATURE: Sub-1ms WebRTC Data Channel (expert)
 * Provides ultra-low latency Peer-to-Peer communication for typing duels.
 */
export class DuelPeerConnection {
    constructor(onMessage) {
        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        this.dataChannel = null;
        this.onMessage = onMessage;

        // UI should trigger help/support if this fails
        this.pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] ICE State: ${this.pc.iceConnectionState}`);
        };
    }

    /**
     * Creates an invite for another player
     */
    async createInvite() {
        this.dataChannel = this.pc.createDataChannel('duel-stream', {
            ordered: false,         // Feature 1: Unordered for sub-1ms speed
            maxRetransmits: 0       // Feature 1: No retransmits to prevent lag spikes
        });
        this._setupDataChannel();

        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);

        return btoa(JSON.stringify(offer));
    }

    /**
     * Joins an existing invite
     */
    async joinInvite(inviteB64) {
        const offer = JSON.parse(atob(inviteB64));
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

        this.pc.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this._setupDataChannel();
        };

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        return btoa(JSON.stringify(answer));
    }

    _setupDataChannel() {
        if (!this.dataChannel) return;
        this.dataChannel.onmessage = (e) => {
            const data = JSON.parse(e.data);
            this.onMessage(data);
        };
        this.dataChannel.onopen = () => console.log('[WebRTC] Data Channel Open');
    }

    sendKeystroke(char, progress) {
        if (this.dataChannel?.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'KEY',
                payload: { char, progress, ts: performance.now() }
            }));
        }
    }
}

/**
 * FEATURE: Edge Leaderboard Sharding Interface (expert)
 * Mock interface for Upstash/Redis Edge sharded leaderboards.
 */
export const edgeLeaderboard = {
    saveScore: async (wpm, accuracy, integrityScore) => {
        // Feature 12: In production, this hits a Vercel Edge Function
        // which shards the leaderboard by WPM buckets [0-50, 50-100, 100-150, 150+]
        console.log(`[Edge] Writing to shard: WPM_${Math.floor(wpm / 50) * 50}`);

        return {
            success: true,
            globalRank: Math.floor(Math.random() * 1000), // Simulated response
            percentile: (wpm / 200 * 100).toFixed(1)
        };
    }
};
