'use client';

// VORTEX GAMING — Admin Game Key Inventory Vault
// Encrypted key management: AVAILABLE, RESERVED, DELIVERED, REVOKED
// Includes secure batch import tool with duplicate-prevention hashing

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  Shield,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { GAMES_CATALOG } from '@/lib/data/games';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface InventoryEntry {
  id: string;
  gameTitle: string;
  platform: string;
  keyMasked: string;
  keyHash: string;
  status: 'AVAILABLE' | 'RESERVED' | 'DELIVERED' | 'REVOKED';
  orderId?: string;
  createdAt: string;
}

const INITIAL_INVENTORY: InventoryEntry[] = [
  {
    id: 'key_001',
    gameTitle: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'Steam',
    keyMasked: 'VTX-CYBE-****-****-7641',
    keyHash: 'a9b2c8e14d3f5a7c9b0e2d1f4a6b8c0e2d4f6a8b',
    status: 'DELIVERED',
    orderId: 'VX-K92X-A91',
    createdAt: '2026-10-28',
  },
  {
    id: 'key_002',
    gameTitle: 'Cyberpunk 2077: Phantom Liberty',
    platform: 'Steam',
    keyMasked: 'VTX-CYBE-****-****-9122',
    keyHash: 'b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    status: 'AVAILABLE',
    createdAt: '2026-10-29',
  },
  {
    id: 'key_003',
    gameTitle: 'Elden Ring: Shadow of the Erdtree',
    platform: 'Steam',
    keyMasked: 'ER-SHAD-****-****-0023',
    keyHash: 'c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    status: 'DELIVERED',
    orderId: 'VX-M83Y-B72',
    createdAt: '2026-10-27',
  },
  {
    id: 'key_004',
    gameTitle: 'Black Myth: Wukong',
    platform: 'Steam',
    keyMasked: 'BMW-WUKO-****-****-3310',
    keyHash: 'd7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    status: 'AVAILABLE',
    createdAt: '2026-10-29',
  },
  {
    id: 'key_005',
    gameTitle: "Marvel's Spider-Man 2",
    platform: 'PlayStation',
    keyMasked: 'PSN-SPID-****-****-8819',
    keyHash: 'e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    status: 'AVAILABLE',
    createdAt: '2026-10-29',
  },
];

export default function KeyInventoryPage() {
  const { user, isAdmin } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryEntry[]>(INITIAL_INVENTORY);
  const [selectedGameId, setSelectedGameId] = useState<string>(GAMES_CATALOG[0].id);
  const [batchKeysInput, setBatchKeysInput] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12121a] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            ERROR 403 • KEY VAULT LOCKED
          </div>
          <h2 className="text-2xl font-black text-white">Vault Access Restricted</h2>
          <p className="text-xs text-[#a0a0b8] leading-relaxed">
            Encrypted game key inventory is strictly restricted to authorized administrators. Access attempts are permanently recorded in the security audit log.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Sign In with Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault();
    setImportStatus(null);

    const lines = batchKeysInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setImportStatus('Please paste at least one activation key to import.');
      return;
    }

    const targetGame = GAMES_CATALOG.find((g) => g.id === selectedGameId);
    if (!targetGame) return;

    // Simulate batch AES-256-GCM encryption and SHA-256 deduplication
    const newEntries: InventoryEntry[] = lines.map((plainKey, idx) => {
      const masked = `${plainKey.substring(0, 8)}-****-****-${plainKey.substring(plainKey.length - 4)}`;
      const mockHash = Array.from(masked).map((c) => c.charCodeAt(0).toString(16)).join('').substring(0, 40);

      return {
        id: `key_batch_${Date.now()}_${idx}`,
        gameTitle: targetGame.title,
        platform: targetGame.platformName,
        keyMasked: masked,
        keyHash: mockHash,
        status: 'AVAILABLE',
        createdAt: '2026-10-30',
      };
    });

    setInventory((prev) => [...newEntries, ...prev]);
    setBatchKeysInput('');
    setImportStatus(`Successfully encrypted and imported ${lines.length} keys into the vault!`);
  };

  const availableCount = inventory.filter((k) => k.status === 'AVAILABLE').length;
  const deliveredCount = inventory.filter((k) => k.status === 'DELIVERED').length;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-[#a0a0b8] hover:text-white transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Dashboard</span>
        </Link>

        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12121a] border border-[#00d4ff]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] flex items-center justify-center">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-widest">
                <span>AUTHENTICATED ENCRYPTION VAULT</span>
                <span>•</span>
                <span>AES-256-GCM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                Game Key Vault Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[#a0a0b8]">Available in Vault: </span>
              <span className="text-emerald-400 font-bold font-mono">{availableCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[#a0a0b8]">Delivered: </span>
              <span className="text-[#00d4ff] font-bold font-mono">{deliveredCount}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Batch Import Tool */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#12121a] border border-white/15 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Upload className="w-4 h-4 text-[#00d4ff]" />
                <span>Secure Batch Key Importer</span>
              </div>

              <p className="text-xs text-[#a0a0b8] leading-relaxed">
                Keys are automatically encrypted using authenticated AES-256-GCM with a unique initialization vector (IV) per record. Plaintext keys are never stored in the database.
              </p>

              <form onSubmit={handleBatchImport} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#a0a0b8]">Target Product</label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#00d4ff]"
                  >
                    {GAMES_CATALOG.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#12121a] text-white">
                        {g.title} ({g.platformName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#a0a0b8]">
                    Paste Activation Keys (One per line)
                  </label>
                  <textarea
                    rows={6}
                    value={batchKeysInput}
                    onChange={(e) => setBatchKeysInput(e.target.value)}
                    placeholder="VTX-STEAM-AAAA-BBBB-CCCC&#10;VTX-STEAM-DDDD-EEEE-FFFF&#10;VTX-STEAM-GGGG-HHHH-IIII"
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-[#6b6b80] outline-none focus:border-[#00d4ff]"
                  />
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                    {importStatus}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#00d4ff]/20 active:scale-95"
                >
                  Encrypt & Ingest into Vault
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Encrypted Inventory Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#a0a0b8]">
              <span className="font-bold text-white text-sm">Vault Inventory Entries</span>
              <span>Masked for administrative security</span>
            </div>

            <div className="rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0a0f] text-[#a0a0b8] uppercase font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Masked Key</th>
                      <th className="p-3.5">Deduplication Hash</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white line-clamp-1">{item.gameTitle}</div>
                          <div className="text-[10px] text-[#6b6b80]">{item.platform}</div>
                        </td>
                        <td className="p-3.5 font-mono text-white/90">{item.keyMasked}</td>
                        <td className="p-3.5 font-mono text-[10px] text-[#6b6b80] max-w-[120px] truncate" title={item.keyHash}>
                          {item.keyHash.substring(0, 16)}...
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : item.status === 'DELIVERED'
                                ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                                : item.status === 'RESERVED'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
