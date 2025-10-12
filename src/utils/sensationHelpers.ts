import { SensationResponse, SensationSession, SensationSite } from '../types';

export const calculateSensationScore = (results: SensationSite[]): number => {
  return results.filter(site => site.response === 'felt').length;
};

export const classifySensationResult = (score: number): 'normal' | 'borderline' | 'at-risk' => {
  if (score >= 5) return 'normal';
  if (score === 4) return 'borderline';
  return 'at-risk';
};

export const getClassificationLabel = (classification: 'normal' | 'borderline' | 'at-risk'): string => {
  switch (classification) {
    case 'normal':
      return 'Normal';
    case 'borderline':
      return 'Borderline';
    case 'at-risk':
      return 'At Risk';
  }
};

export const getClassificationEmoji = (classification: 'normal' | 'borderline' | 'at-risk'): string => {
  switch (classification) {
    case 'normal':
      return '✅';
    case 'borderline':
      return '⚠️';
    case 'at-risk':
      return '🔴';
  }
};

export const getSugiMessage = (classification: 'normal' | 'borderline' | 'at-risk'): string => {
  switch (classification) {
    case 'normal':
      return "Nice job—small steps keep you safe.";
    case 'borderline':
      return "Let's keep monitoring. Consider discussing with your doctor.";
    case 'at-risk':
      return "Please schedule a visit with your healthcare provider soon.";
  }
};

export const initializeSensationSites = (): SensationSite[] => {
  const sites: SensationSite[] = [];
  const toes: (1 | 3 | 5)[] = [1, 3, 5];
  const feet: ('left' | 'right')[] = ['left', 'right'];

  feet.forEach(foot => {
    toes.forEach(toe => {
      sites.push({ toe, foot, response: null });
    });
  });

  return sites;
};

export const getToeLabel = (toe: 1 | 3 | 5): string => {
  switch (toe) {
    case 1:
      return 'big toe';
    case 3:
      return '3rd toe';
    case 5:
      return '5th toe';
  }
};

export const getTestInstruction = (site: SensationSite): string => {
  const toeLabel = getToeLabel(site.toe);
  return `Touch the ${site.foot} ${toeLabel}`;
};
