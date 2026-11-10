import { RaceDto } from '../calendar.dto';

/*
 * Sample responses that follow the documented structure of the Jolpica race schedule.
 * The values are representative; the tests do not depend on them being historically exact.
 */

export const STANDARD_WEEKEND: RaceDto = {
  season: '2024',
  round: '3',
  raceName: 'Australian Grand Prix',
  Circuit: {
    circuitId: 'albert_park',
    circuitName: 'Albert Park Grand Prix Circuit',
    Location: { lat: '-37.8497', long: '144.968', locality: 'Melbourne', country: 'Australia' },
  },
  date: '2024-03-24',
  time: '04:00:00Z',
  FirstPractice: { date: '2024-03-22', time: '01:30:00Z' },
  SecondPractice: { date: '2024-03-22', time: '05:00:00Z' },
  ThirdPractice: { date: '2024-03-23', time: '01:30:00Z' },
  Qualifying: { date: '2024-03-23', time: '05:00:00Z' },
};

export const SPRINT_WEEKEND: RaceDto = {
  season: '2024',
  round: '5',
  raceName: 'Chinese Grand Prix',
  Circuit: {
    circuitId: 'shanghai',
    circuitName: 'Shanghai International Circuit',
    Location: { lat: '31.3389', long: '121.22', locality: 'Shanghai', country: 'China' },
  },
  date: '2024-04-21',
  time: '07:00:00Z',
  FirstPractice: { date: '2024-04-19', time: '03:30:00Z' },
  SprintQualifying: { date: '2024-04-19', time: '07:30:00Z' },
  Sprint: { date: '2024-04-20', time: '03:00:00Z' },
  Qualifying: { date: '2024-04-20', time: '07:00:00Z' },
};

/** Before 2022 only the date and time of the Grand Prix are published. */
export const RACE_ONLY: RaceDto = {
  season: '2019',
  round: '6',
  raceName: 'Monaco Grand Prix',
  Circuit: {
    circuitId: 'monaco',
    circuitName: 'Circuit de Monaco',
    Location: { lat: '43.7347', long: '7.42056', locality: 'Monte-Carlo', country: 'Monaco' },
  },
  date: '2019-05-26',
  time: '13:10:00Z',
};

/** Early seasons have no start time at all. */
export const RACE_WITHOUT_TIME: RaceDto = {
  season: '1950',
  round: '1',
  raceName: 'British Grand Prix',
  Circuit: {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    Location: { lat: '52.0786', long: '-1.01694', locality: 'Silverstone', country: 'UK' },
  },
  date: '1950-05-13',
};

/** Sprint format used in 2021 and 2022: Friday qualifying comes before Saturday practice. */
export const LEGACY_SPRINT_WEEKEND: RaceDto = {
  season: '2021',
  round: '10',
  raceName: 'British Grand Prix',
  Circuit: {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    Location: { lat: '52.0786', long: '-1.01694', locality: 'Silverstone', country: 'UK' },
  },
  date: '2021-07-18',
  time: '14:00:00Z',
  FirstPractice: { date: '2021-07-16', time: '11:30:00Z' },
  Qualifying: { date: '2021-07-16', time: '15:00:00Z' },
  SecondPractice: { date: '2021-07-17', time: '11:30:00Z' },
  Sprint: { date: '2021-07-17', time: '15:30:00Z' },
};
