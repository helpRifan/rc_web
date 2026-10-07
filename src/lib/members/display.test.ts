import { describe, expect, it } from 'vitest';
import { firstName, initialsOf, levelLabel, photoUrl } from './display';

describe('initialsOf', () => {
  it.each([
    ['Grace', 'G'],
    ['Mohamed Rifan Ajmal', 'MA'],
    ['Dr. Arockia Selvakumar A.', 'AS'],
    ['  vinayak  ', 'V'],
    ['Li Na', 'L'],
    ['Prof. Anand Kumar', 'AK'],
    ['', ''],
  ])('%s gives %s', (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe('levelLabel', () => {
  it.each([
    [{ level: 'board', division: 'none' }, 'Board'],
    [{ level: 'head', division: 'projects' }, 'Core team'],
    [{ level: 'lead', division: 'media' }, 'Core team'],
    [{ level: 'core', division: 'teaching' }, 'Core team'],
    [{ level: 'member', division: 'webdev' }, 'Member'],
    [{ level: 'head', division: 'alumni' }, 'Alumni'],
    [{ level: 'faculty', division: 'none' }, 'Faculty'],
  ])('%o is %s', (member, label) => {
    expect(levelLabel(member)).toBe(label);
  });
});

describe('photoUrl', () => {
  it('asks ImageKit for a face crop at the exact size', () => {
    expect(photoUrl('https://ik.imagekit.io/Rifan/robotics-club/members/a.jpg', { w: 512, h: 512 })).toBe(
      'https://ik.imagekit.io/Rifan/robotics-club/members/a.jpg?tr=w-512%2Ch-512%2Cfo-face%2Cq-80',
    );
  });

  it('leaves other hosts alone', () => {
    expect(photoUrl('https://example.com/a.jpg', { w: 10, h: 10 })).toBe('https://example.com/a.jpg');
  });
});

describe('firstName', () => {
  it('takes the first word', () => {
    expect(firstName('Mohamed Rifan Ajmal')).toBe('Mohamed');
  });
});
