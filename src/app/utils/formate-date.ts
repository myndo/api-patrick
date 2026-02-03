import { DateTime, DurationLike } from 'luxon';

export const subtractYears = (numOfYears: number, date: Date) => {
  const dateSub = new Date(date.getTime());
  dateSub.setFullYear(dateSub.getFullYear() - numOfYears);
  return dateSub;
};

export const formateDDDate = (date: Date, lang: string) => {
  return DateTime.fromJSDate(date).setLocale(lang).toFormat('DD');
};

export const formateHHDate = (date: Date, hour: number) => {
  const timeOfDay = DateTime.fromJSDate(date)
    .set({ hour, minute: 0, second: 0, millisecond: 0 })
    .toLocal();

  return timeOfDay;
};

export const formateDayHHDate = (date: string, lang: string) => {
  const dateInit = DateTime.fromISO(String(date));
  return dateInit.setLocale(lang).toFormat('t');
};

export const formateMMDate = (date: Date, lang: string) => {
  return DateTime.fromJSDate(date).setLocale(lang).toFormat('LLL yyyy');
};

export const formateMMNumericDate = (date: Date) => {
  return DateTime.fromJSDate(date)
    .setLocale('it')
    .toLocaleString({ month: 'numeric' });
};

export const formateDDNumericDate = (date: Date) => {
  return DateTime.fromJSDate(date)
    .setLocale('it')
    .toLocaleString({ day: 'numeric' });
};

export const formateHHNumericDate = (date: Date) => {
  const hour = DateTime.fromJSDate(date)
    .setLocale('it')
    .toLocaleString({ hour: 'numeric' });

  return hour === '00' ? '24' : hour;
};

export const formateYYYYDate = (date: Date) =>
  DateTime.fromJSDate(date).toLocaleString({ year: 'numeric' });

export const startOfDayYYMMDD = ({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) => {
  const dateTime = new Date(`${year}-${month}-${day}`);

  const startOfDay = DateTime.fromJSDate(dateTime).startOf('day').toJSDate();
  const endOfDay = DateTime.fromJSDate(dateTime).endOf('day').toJSDate();

  return { startOfDay, endOfDay };
};

export const formateToT = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('T');

export const formateToRFC2822 = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('DDDD');

export const formateddLLyyyy = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('dd LLL yyyy');

export const formateYYMMDDDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyy/LL/dd');

export const formateDDMMYYDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');

export const formateHHmmDate = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('HH:mm');

export const formateNowDateYYMMDD = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyyLLdd');

export const dateTimeNowUtc = () => DateTime.utc().toJSDate();

export const addMinutesToDateTimeNowUtc = (minutes: number) =>
  DateTime.utc().plus({ minutes: minutes }).toJSDate();

export const stringDateFormateYYMMDDUtc = (date: string) =>
  DateTime.fromFormat(date, 'dd/MM/yyyy').toISO() as unknown as Date;

export const addDaysToTimeNowUtcDate = (dayNumber: number) =>
  DateTime.utc().plus({ days: dayNumber }).toJSDate();

export const addMonthsToTimeNowUtcDate = (month: number) =>
  DateTime.utc().plus({ months: month }).toJSDate();

export const addDaysToTimeNowUtcUnixInteger = (dayNumber: number) =>
  DateTime.utc().plus({ days: dayNumber }).toUnixInteger();

export const addDaysToDateUtcUnixInteger = ({
  date,
  day,
}: {
  date: Date;
  day: number;
}) => {
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate).plus({ days: day }).toUnixInteger();
};

export const addMonthsFormateDDMMYYDate = ({
  date,
  month,
}: {
  date: Date;
  month: number;
}) => {
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate).plus({ months: month }).toJSDate();
};

export const addYearsFormateDDMMYYDate = ({
  date,
  year,
}: {
  date: Date;
  year: number;
}) => {
  const dateFormate = String(DateTime.fromJSDate(date));
  return DateTime.fromISO(dateFormate).plus({ years: year }).toJSDate();
};

export const substrateDaysToTimeNowUtcDate = (value: number) =>
  DateTime.utc().minus({ days: value }).toJSDate();

export const substrateDaysToTimeNowUtcUnixInteger = (value: number) =>
  DateTime.utc().minus({ days: value }).toUnixInteger();

export const formateNowDateUnixInteger = (date: Date) =>
  DateTime.fromJSDate(date).toUnixInteger() as unknown as number;

export const fromIsoToYYYYMMDD = (date: Date) =>
  DateTime.fromISO(date as unknown as string).toFormat('yyyy/LL/dd');

export const dateTimeNowUtcUnixInteger = () =>
  DateTime.fromISO(DateTime.utc().toISO() as string).toUnixInteger();

export const formatDateToUtc = (date: string) =>
  DateTime.fromFormat(date, 'yyyy-mm-dd').toISO() as unknown as Date;

export const formatDateJsToUtc = (date: Date) =>
  DateTime.fromJSDate(date).toUTC().toJSDate();

export const addToDateUtc = ({
  date,
  plus,
}: {
  date: Date;
  plus: DurationLike;
}) =>
  DateTime.fromISO(DateTime.fromJSDate(date).toString())
    .plus(plus)
    .toUTC()
    .toJSDate();

const timeMult = { days: 86_400, hrs: 3_600, min: 60, sec: 1 };
type OffsetUnit = keyof typeof timeMult;

/** Create a UTC `Date` from current time + *optional* offset */
export const timeNowUTC = (offset: number = 0, from: OffsetUnit = 'sec') =>
  DateTime.utc()
    .plus({ seconds: offset * timeMult[from] })
    .toJSDate();

export const timeMinusNowUTC = (offset: number = 0, from: OffsetUnit = 'sec') =>
  DateTime.utc()
    .minus({ seconds: offset * timeMult[from] })
    .toJSDate();

export const formatStatsYearDate = (date: Date) => {
  const d = new Date(date);
  return String(d.getFullYear());
};

export const formatStatsNextMonth = (date: Date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 2}`;
};
export const lastDayMonth = ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  return new Date(year, month, 1);
};

export const firstDayMonth = ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  return new Date(year, month - 1, 1);
};

export const firstDayYear = (year: number) => {
  return new Date(year, 0, 1);
};

export const lastDayYear = (year: number) => {
  return new Date(year, 11, 31);
};

export const parseYearMonth = (dateString: string) => {
  const [year, month] = dateString.split('-').map(Number);
  return { year, month };
};

export const startOfDayFormatStatsDays = (date: string) => {
  const startOfDay = DateTime.fromFormat(date, 'yyyy-MM-dd')
    .startOf('day')
    .toJSDate();
  const endOfDay = DateTime.fromFormat(date, 'yyyy-MM-dd')
    .endOf('day')
    .toJSDate();

  return { startOfDay, endOfDay };
};

export const formatStatsYear = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyy');

export const formatStatsMonth = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyy-MM');

export const formatStatsDay = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('yyyy-MM-dd');

export const formatStatsDayHH = (date: Date) =>
  DateTime.fromJSDate(date).toFormat('HH');
