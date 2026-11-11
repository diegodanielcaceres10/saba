import { DriverStanding } from '@features/drivers';
import { attachDrivers } from './attach-drivers';
import { toTeamStanding } from './teams.mapper';
import { MCLAREN, RED_BULL } from './testing/teams.fixtures';

const driver = (
  id: string,
  givenName: string,
  familyName: string,
  teamIds: string[],
  number: number | null = null,
): DriverStanding => ({
  position: 1,
  points: 0,
  wins: 0,
  driver: { id, number, code: null, givenName, familyName, nationality: 'Testish' },
  teams: teamIds.map((teamId) => ({ id: teamId, name: teamId })),
});

const VERSTAPPEN = driver('verstappen', 'Max', 'Verstappen', ['red_bull'], 1);
const PEREZ = driver('perez', 'Sergio', 'Pérez', ['red_bull'], 11);
const NORRIS = driver('norris', 'Lando', 'Norris', ['mclaren'], 4);
const RICCIARDO = driver('ricciardo', 'Daniel', 'Ricciardo', ['rb', 'red_bull']);

const teams = [toTeamStanding(RED_BULL), toTeamStanding(MCLAREN)];
const driverIdsOf = (standings: ReturnType<typeof attachDrivers>, teamId: string) =>
  standings.find((s) => s.team.id === teamId)?.drivers.map((d) => d.id);

describe('attachDrivers', () => {
  it('gives each team the drivers who raced for it', () => {
    const result = attachDrivers(teams, [VERSTAPPEN, NORRIS, PEREZ]);

    expect(driverIdsOf(result, 'red_bull')).toEqual(['verstappen', 'perez']);
    expect(driverIdsOf(result, 'mclaren')).toEqual(['norris']);
  });

  it('describes each driver by name and number', () => {
    const [redBull] = attachDrivers(teams, [VERSTAPPEN]);

    expect(redBull.drivers).toEqual([{ id: 'verstappen', name: 'Max Verstappen', number: 1 }]);
  });

  it('lists a driver who changed teams under each of them', () => {
    const result = attachDrivers(
      [...teams, toTeamStanding({ ...RED_BULL, Constructor: { constructorId: 'rb', name: 'RB' } })],
      [RICCIARDO],
    );

    expect(driverIdsOf(result, 'rb')).toEqual(['ricciardo']);
    expect(driverIdsOf(result, 'red_bull')).toEqual(['ricciardo']);
  });

  it('keeps the order of the drivers it is given', () => {
    const result = attachDrivers(teams, [PEREZ, VERSTAPPEN]);

    expect(driverIdsOf(result, 'red_bull')).toEqual(['perez', 'verstappen']);
  });

  it('leaves a team without drivers when nobody raced for it', () => {
    expect(driverIdsOf(attachDrivers(teams, [VERSTAPPEN]), 'mclaren')).toEqual([]);
  });

  it('ignores drivers of teams that are not in the standings', () => {
    const result = attachDrivers(teams, [driver('someone', 'Some', 'One', ['other_team'])]);

    expect(result.flatMap((s) => s.drivers)).toEqual([]);
  });

  it('keeps the rest of each standing as it was', () => {
    const [redBull] = attachDrivers(teams, [VERSTAPPEN]);

    expect(redBull).toMatchObject({ position: 1, points: 589, wins: 21 });
  });
});
