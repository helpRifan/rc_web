// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parseCertificateFolder } from './parse-folder';

// A synthetic folder in the owner's layout. Every name and address is invented.
let root: string;
const put = (path: string, content: string) => {
  mkdirSync(join(root, path, '..'), { recursive: true });
  writeFileSync(join(root, path), content);
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'certs-'));
  put('LFR/participants/Team Alpha/Test One_LineFollower.pdf', 'pdf-one');
  put('LFR/participants/Team Alpha/Test Two_LineFollower.pdf', 'pdf-two');
  put('LFR/participants/Team Alpha/email.txt', ' Lead.Alpha@Example.com \n');
  put('LFR/participants/Team Beta/Test Three_LineFollower.pdf', 'pdf-three');
  put('LFR/participants/Team Beta/Test Three copy_LineFollower.pdf', 'pdf-three');
  put('LFR/Bulk create 1/1.pdf', 'pdf-one');
  put('LFR/Bulk create 1/2.pdf', 'pdf-two');
  put('LFR/stray.pdf', 'pdf-stray');
  put('Winners&Runnerups/LFR/1st/Test One_LFR_1st.pdf', 'pdf-win');
  put('Winners&Runnerups/LFR/1st/email.txt', 'lead.alpha@example.com');
  put('Winners&Runnerups/LFR/2nd/Test Four_LFR_2nd.pdf', 'pdf-second');
  put('Winners&Runnerups/Bulk/1.pdf', 'pdf-win');
  put(
    'Winners&Runnerups/winners_manifest.json',
    JSON.stringify([
      { index: 1, event: 'Line Follower', event_folder: 'LFR', place: '1st', place_folder: '1st', team: 'Team Alpha', name: 'Test One', email: 'lead.alpha@example.com' },
      { index: 2, event: 'Line Follower', event_folder: 'LFR', place: '2nd', place_folder: '2nd', team: 'Team Gamma', name: 'Test Four', email: 'lead.gamma@example.com' },
    ]),
  );
  put(
    'python/send_log.json',
    JSON.stringify({
      'participant_LFR_Team Alpha': { timestamp: '2026-09-17T10:15:00', team: 'Team Alpha' },
      'winner_LFR_Team Alpha': { timestamp: '2026-09-18T09:00:00', team: 'Team Alpha' },
    }),
  );
  put('.env', 'SECRET=never-read');
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('parseCertificateFolder', () => {
  it('reads one row per distinct named PDF, skipping numbered copies and byte-identical duplicates', () => {
    const { rows, duplicates, numbered, problems } = parseCertificateFolder(root);
    expect(rows).toHaveLength(5);
    expect(numbered).toBe(3);
    expect(duplicates).toBe(1);
    expect(problems).toEqual([
      'Line Follower: a PDF outside a team folder was skipped',
      'no folder for Obstacle Race',
      'no folder for Robo Race',
      'no folder for Robo Soccer',
      'no folder for Robo Sumo',
    ]);
  });

  it('takes the team from the folder and the email from email.txt', () => {
    const { rows } = parseCertificateFolder(root);
    const one = rows.find(r => r.type === 'participation' && r.recipientName === 'Test One')!;
    expect(one).toMatchObject({ eventSlug: 'line-follower', teamName: 'Team Alpha', contactEmail: 'lead.alpha@example.com', nameNorm: 'test one', place: null });
    expect(rows.find(r => r.recipientName === 'Test Three')?.contactEmail).toBeNull();
  });

  it('maps winners places to winner and runner-up, with the manifest team and email', () => {
    const { rows } = parseCertificateFolder(root);
    expect(rows.find(r => r.type === 'winner')).toMatchObject({ recipientName: 'Test One', place: 1, teamName: 'Team Alpha' });
    expect(rows.find(r => r.type === 'runner_up')).toMatchObject({ recipientName: 'Test Four', place: 2, teamName: 'Team Gamma', contactEmail: 'lead.gamma@example.com' });
  });

  it('dates each certificate by its email, and the never-emailed ones by the first send', () => {
    const { rows } = parseCertificateFolder(root);
    expect(rows.find(r => r.type === 'participation' && r.recipientName === 'Test One')).toMatchObject({ issuedOn: '2026-09-17', emailedAt: '2026-09-17T10:15:00' });
    expect(rows.find(r => r.type === 'winner')).toMatchObject({ issuedOn: '2026-09-18' });
    expect(rows.find(r => r.recipientName === 'Test Four')).toMatchObject({ issuedOn: '2026-09-17', emailedAt: null });
  });

  it('hashes every PDF with SHA-256', () => {
    for (const row of parseCertificateFolder(root).rows) expect(row.pdfSha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
