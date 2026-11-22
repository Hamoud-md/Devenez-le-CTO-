import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PROGRESS,
  clearProgress,
  loadProgress,
  saveProgress,
} from './persistence';
import type { SavedProgress } from '../types';

describe('Persistence Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renvoie les valeurs par défaut sans sauvegarde', () => {
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it('sauvegarde puis recharge la progression', () => {
    const data: SavedProgress = {
      ...DEFAULT_PROGRESS,
      profile: {
        level: 'confirme',
        activities: ['running'],
        goal: 'technique',
        motion: 'pompes',
        preference: 'essentiel',
      },
      guidance: {
        currentStep: 'exploration',
        completed: ['profil', 'preparation', 'decouverte'],
      },
      detailMode: 'essentiel',
      anatomyLayer: true,
    };

    expect(saveProgress(data)).toBe(true);

    const loaded = loadProgress();
    expect(loaded.profile?.level).toBe('confirme');
    expect(loaded.guidance.currentStep).toBe('exploration');
    expect(loaded.guidance.completed).toHaveLength(3);
    expect(loaded.detailMode).toBe('essentiel');
    expect(loaded.anatomyLayer).toBe(true);
  });

  it('gère un JSON corrompu sans planter', () => {
    localStorage.setItem('tlma:progress:v1', '{not valid json');
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it('ignore une sauvegarde de version incompatible', () => {
    localStorage.setItem(
      'tlma:progress:v1',
      JSON.stringify({ ...DEFAULT_PROGRESS, version: 999 }),
    );
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it('efface les données locales', () => {
    saveProgress({ ...DEFAULT_PROGRESS, detailMode: 'essentiel' });
    clearProgress();
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });
});
