'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { getEraSkinId, setEraSkinId, clearEraSkin } from '@/lib/idb-store';
import { soundButtonClick, soundSave } from '@/lib/sounds';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface EraSkin {
  id: string;
  name: string;
  yearRange: string;
  description: string;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
  cssVars: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════
// Default (Warm Sepia) values from globals.css :root
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CSS_VARS: Record<string, string> = {
  '--background': '#f5edd6',
  '--foreground': '#3d2b1f',
  '--card': '#faf6eb',
  '--card-foreground': '#3d2b1f',
  '--popover': '#faf6eb',
  '--popover-foreground': '#3d2b1f',
  '--primary': '#8b5e3c',
  '--primary-foreground': '#faf6eb',
  '--secondary': '#e8dcc8',
  '--secondary-foreground': '#5c4033',
  '--muted': '#e8dcc8',
  '--muted-foreground': '#8b7355',
  '--accent': '#c4956a',
  '--accent-foreground': '#3d2b1f',
  '--border': '#c4b594',
  '--input': '#d4c5a9',
  '--ring': '#8b5e3c',
  '--chart-1': '#c4956a',
  '--chart-2': '#8b5e3c',
  '--chart-3': '#6b4226',
  '--chart-4': '#d4a574',
  '--chart-5': '#e8c9a0',
  '--sidebar': '#e8dcc8',
  '--sidebar-foreground': '#3d2b1f',
  '--sidebar-primary': '#8b5e3c',
  '--sidebar-primary-foreground': '#faf6eb',
  '--sidebar-accent': '#d4c5a9',
  '--sidebar-accent-foreground': '#3d2b1f',
  '--sidebar-border': '#c4b594',
  '--sidebar-ring': '#8b5e3c',
};

// ═══════════════════════════════════════════════════════════════
// Era definitions
// ═══════════════════════════════════════════════════════════════

const ERA_SKINS: EraSkin[] = [
  {
    id: 'default',
    name: 'Default',
    yearRange: 'Warm Sepia',
    description: 'Classic rewind look — polaroids, parchment, and gentle nostalgia.',
    colors: {
      background: '#f5edd6',
      foreground: '#3d2b1f',
      accent: '#c4956a',
      muted: '#e8dcc8',
    },
    cssVars: DEFAULT_CSS_VARS,
  },
  {
    id: '70s-groovy',
    name: '70s Groovy',
    yearRange: '1970–1979',
    description: 'Wood paneling, shag carpet, and good vibes.',
    colors: {
      background: '#f5e6d0',
      foreground: '#4a3728',
      accent: '#d2691e',
      muted: '#a0826d',
    },
    cssVars: {
      '--background': '#f5e6d0',
      '--foreground': '#4a3728',
      '--card': '#faf0e2',
      '--card-foreground': '#4a3728',
      '--popover': '#faf0e2',
      '--popover-foreground': '#4a3728',
      '--primary': '#8b6914',
      '--primary-foreground': '#faf0e2',
      '--secondary': '#dcc8a8',
      '--secondary-foreground': '#5c4033',
      '--muted': '#a0826d',
      '--muted-foreground': '#6b5443',
      '--accent': '#d2691e',
      '--accent-foreground': '#faf0e2',
      '--border': '#c4a882',
      '--input': '#d4bc96',
      '--ring': '#d2691e',
      '--chart-1': '#d2691e',
      '--chart-2': '#8b6914',
      '--chart-3': '#6b4226',
      '--chart-4': '#a0826d',
      '--chart-5': '#dcc8a8',
      '--sidebar': '#dcc8a8',
      '--sidebar-foreground': '#4a3728',
      '--sidebar-primary': '#8b6914',
      '--sidebar-primary-foreground': '#faf0e2',
      '--sidebar-accent': '#d4bc96',
      '--sidebar-accent-foreground': '#4a3728',
      '--sidebar-border': '#c4a882',
      '--sidebar-ring': '#d2691e',
    },
  },
  {
    id: '80s-neon',
    name: '80s Neon',
    yearRange: '1980–1989',
    description: 'Miami Vice, arcades, and electric everything.',
    colors: {
      background: '#1a1a2e',
      foreground: '#e0e0ff',
      accent: '#ff00ff',
      muted: '#8888aa',
    },
    cssVars: {
      '--background': '#1a1a2e',
      '--foreground': '#e0e0ff',
      '--card': '#222244',
      '--card-foreground': '#e0e0ff',
      '--popover': '#222244',
      '--popover-foreground': '#e0e0ff',
      '--primary': '#00d4ff',
      '--primary-foreground': '#1a1a2e',
      '--secondary': '#2a2a50',
      '--secondary-foreground': '#c0c0ee',
      '--muted': '#8888aa',
      '--muted-foreground': '#9999bb',
      '--accent': '#ff00ff',
      '--accent-foreground': '#1a1a2e',
      '--border': '#444477',
      '--input': '#333366',
      '--ring': '#ff00ff',
      '--chart-1': '#ff00ff',
      '--chart-2': '#00d4ff',
      '--chart-3': '#ff4488',
      '--chart-4': '#8888aa',
      '--chart-5': '#44ff88',
      '--sidebar': '#222244',
      '--sidebar-foreground': '#e0e0ff',
      '--sidebar-primary': '#00d4ff',
      '--sidebar-primary-foreground': '#1a1a2e',
      '--sidebar-accent': '#333366',
      '--sidebar-accent-foreground': '#e0e0ff',
      '--sidebar-border': '#444477',
      '--sidebar-ring': '#ff00ff',
    },
  },
  {
    id: '90s-grunge',
    name: '90s Grunge',
    yearRange: '1990–1999',
    description: 'Flannel, coffee shops, and nevermind the mainstream.',
    colors: {
      background: '#2d2d2d',
      foreground: '#d4c8b0',
      accent: '#8b4513',
      muted: '#7a7a6a',
    },
    cssVars: {
      '--background': '#2d2d2d',
      '--foreground': '#d4c8b0',
      '--card': '#383838',
      '--card-foreground': '#d4c8b0',
      '--popover': '#383838',
      '--popover-foreground': '#d4c8b0',
      '--primary': '#8b4513',
      '--primary-foreground': '#f0e6d4',
      '--secondary': '#444438',
      '--secondary-foreground': '#b8a888',
      '--muted': '#7a7a6a',
      '--muted-foreground': '#999980',
      '--accent': '#8b4513',
      '--accent-foreground': '#f0e6d4',
      '--border': '#555548',
      '--input': '#4a4a40',
      '--ring': '#8b4513',
      '--chart-1': '#8b4513',
      '--chart-2': '#6b8e23',
      '--chart-3': '#a0522d',
      '--chart-4': '#7a7a6a',
      '--chart-5': '#d4c8b0',
      '--sidebar': '#383838',
      '--sidebar-foreground': '#d4c8b0',
      '--sidebar-primary': '#8b4513',
      '--sidebar-primary-foreground': '#f0e6d4',
      '--sidebar-accent': '#4a4a40',
      '--sidebar-accent-foreground': '#d4c8b0',
      '--sidebar-border': '#555548',
      '--sidebar-ring': '#8b4513',
    },
  },
  {
    id: '2000s-y2k',
    name: '2000s Y2K',
    yearRange: '2000–2009',
    description: 'iMac G3, Windows XP, and the frosted future.',
    colors: {
      background: '#e8f0fe',
      foreground: '#333366',
      accent: '#0066cc',
      muted: '#8899aa',
    },
    cssVars: {
      '--background': '#e8f0fe',
      '--foreground': '#333366',
      '--card': '#f0f5ff',
      '--card-foreground': '#333366',
      '--popover': '#f0f5ff',
      '--popover-foreground': '#333366',
      '--primary': '#0066cc',
      '--primary-foreground': '#ffffff',
      '--secondary': '#d0ddf0',
      '--secondary-foreground': '#333366',
      '--muted': '#8899aa',
      '--muted-foreground': '#667799',
      '--accent': '#0066cc',
      '--accent-foreground': '#ffffff',
      '--border': '#b0c4de',
      '--input': '#c0d0e8',
      '--ring': '#0066cc',
      '--chart-1': '#0066cc',
      '--chart-2': '#3399ff',
      '--chart-3': '#9933cc',
      '--chart-4': '#8899aa',
      '--chart-5': '#66ccff',
      '--sidebar': '#d0ddf0',
      '--sidebar-foreground': '#333366',
      '--sidebar-primary': '#0066cc',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#c0d0e8',
      '--sidebar-accent-foreground': '#333366',
      '--sidebar-border': '#b0c4de',
      '--sidebar-ring': '#0066cc',
    },
  },
  {
    id: '2010s-minimal',
    name: '2010s Minimal',
    yearRange: '2010–2019',
    description: 'Flat design, thin fonts, and early Instagram filters.',
    colors: {
      background: '#fafafa',
      foreground: '#222222',
      accent: '#e1306c',
      muted: '#aaaaaa',
    },
    cssVars: {
      '--background': '#fafafa',
      '--foreground': '#222222',
      '--card': '#ffffff',
      '--card-foreground': '#222222',
      '--popover': '#ffffff',
      '--popover-foreground': '#222222',
      '--primary': '#e1306c',
      '--primary-foreground': '#ffffff',
      '--secondary': '#f0f0f0',
      '--secondary-foreground': '#444444',
      '--muted': '#e0e0e0',
      '--muted-foreground': '#888888',
      '--accent': '#e1306c',
      '--accent-foreground': '#ffffff',
      '--border': '#dddddd',
      '--input': '#eeeeee',
      '--ring': '#e1306c',
      '--chart-1': '#e1306c',
      '--chart-2': '#f77737',
      '--chart-3': '#c13584',
      '--chart-4': '#aaaaaa',
      '--chart-5': '#405de6',
      '--sidebar': '#f0f0f0',
      '--sidebar-foreground': '#222222',
      '--sidebar-primary': '#e1306c',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#eeeeee',
      '--sidebar-accent-foreground': '#222222',
      '--sidebar-border': '#dddddd',
      '--sidebar-ring': '#e1306c',
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function applySkin(skin: EraSkin) {
  const root = document.documentElement;
  Object.entries(skin.cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute('data-era-skin', skin.id);
  setEraSkinId(skin.id).catch(() => {});
}

function applyDefault() {
  const root = document.documentElement;
  Object.entries(DEFAULT_CSS_VARS).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.removeAttribute('data-era-skin');
  clearEraSkin().catch(() => {});
}

async function getStoredSkinId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return getEraSkinId();
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function EraSkins() {
  const [activeSkinId, setActiveSkinId] = useState<string | null>(null);

  // Load stored skin on mount
  useEffect(() => {
    (async () => {
      const stored = await getStoredSkinId();
      if (stored) {
        const skin = ERA_SKINS.find((s) => s.id === stored);
        if (skin) {
          applySkin(skin);
          setActiveSkinId(stored);
        }
      }
    })();
  }, []);

  const handleApply = useCallback((skin: EraSkin) => {
    soundButtonClick();
    if (skin.id === 'default') {
      applyDefault();
      setActiveSkinId(null);
    } else {
      applySkin(skin);
      setActiveSkinId(skin.id);
    }
    soundSave();
  }, []);

  const handleReset = useCallback(() => {
    soundButtonClick();
    applyDefault();
    setActiveSkinId(null);
  }, []);

  // Swatch colors for a skin
  const swatchColors = (skin: EraSkin) => [
    skin.colors.background,
    skin.colors.foreground,
    skin.colors.accent,
    skin.colors.muted,
  ];

  return (
    <section className="sk-paper sk-noise rounded-xl p-6 md:p-8 mb-8">
      {/* Header — always uses default sepia palette */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="old-title text-2xl md:text-3xl mb-1" style={{ color: '#3d2b1f' }}>
            Era Skins
          </h2>
          <p className="old-body text-sm" style={{ color: '#8b7355' }}>
            Transport the whole app to a different decade
          </p>
        </div>
        {activeSkinId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="old-label gap-1.5"
            style={{
              borderColor: '#c4b594',
              color: '#5c4033',
              background: '#faf6eb',
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Default
          </Button>
        )}
      </div>

      {/* Grid of skin cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ERA_SKINS.map((skin) => {
          const isActive = activeSkinId === skin.id;
          return (
            <button
              key={skin.id}
              onClick={() => handleApply(skin)}
              className="group text-left rounded-lg p-4 transition-all duration-200"
              style={{
                background: '#faf6eb',
                border: isActive
                  ? '2px solid #8b5e3c'
                  : '2px solid #c4b594',
                boxShadow: isActive
                  ? '0 0 12px rgba(139, 94, 60, 0.35), inset 0 0 0 1px rgba(139, 94, 60, 0.1)'
                  : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Era name */}
              <h3 className="old-label text-base font-semibold mb-0.5" style={{ color: '#3d2b1f' }}>
                {skin.name}
              </h3>

              {/* Year range */}
              <p className="old-typewriter text-xs mb-2" style={{ color: '#8b7355' }}>
                {skin.yearRange}
              </p>

              {/* Color swatch strip */}
              <div className="flex gap-1 mb-3">
                {swatchColors(skin).map((color, i) => (
                  <div
                    key={i}
                    className="h-5 flex-1 rounded-sm"
                    style={{
                      backgroundColor: color,
                      border: '1px solid rgba(0,0,0,0.12)',
                    }}
                  />
                ))}
              </div>

              {/* Description */}
              <p className="old-body text-xs leading-relaxed" style={{ color: '#8b7355' }}>
                {skin.description}
              </p>

              {/* Active badge */}
              {isActive && (
                <span
                  className="old-label inline-block mt-2 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{
                    background: '#8b5e3c',
                    color: '#faf6eb',
                  }}
                >
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}