// Parity tests ported from Src/Audible.Tests/*.cs (NUnit -> Jest).
import { PiCalculator, SUPPORTED_DIGIT_COUNTS } from '../pi-calculator';
import { PiDigitSequence } from '../pi-digits';

const PI_1000_DECIMAL = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
const PI_1000_BASE12 = "3823B1343343B6911972133694023B2512820357341B31985A29829374542A33A39298377A1011741B20181A11796B34A9B3B658500B16BB33A1B55202281325332114B027022485423A133714640806347554138B32733137A15095279561A1302176864273265517B391458B3161B19AB74016513840B06B2250028984180372416A223603258279012B18615371BA7535B223466A37A32A055242BB101344787645678450AB1910439811443607A530A12430422BB88015232074659B93921716913790293B74526954022B4993B4B82B4A315B77A89843861193330391289BBAAB526618436AA39B314005746B1448AA836556216013253A419451AA323101412395B052107462B3273480531549B3414B71330AB410023B446384722B78483B0472223B28556390813535237A2A4773736745A41485B81B8051102717A2522B3129A6160B74549B33A794378320397473B7103A21086042003216992A74530541237415920260263589524B27499391529824AA73559A04093941652B250B02A4A7180AA4006A2073615A091743241263131A96A613511622139443267322A001166973B1502B8713846B2345B2A7551824814783231616863304674308B19B034630747516A9013A7309AAA334827635458433231347605106361199";

function collect(seq: PiDigitSequence): string {
  const out: string[] = [];
  seq.reset();
  out.push(seq.current);
  while (seq.moveNext()) out.push(seq.current);
  return out.join('');
}

describe('PiCalculator.calculatePi decimal (port of PiCalculatorFixture.CalculatePiAsDecimal)', () => {
  test('result is not null', async () => {
    const pi = new PiCalculator();
    const result = await pi.calculatePi('decimal', 1000);
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  }, 60000);

  test('pi string has 1001 digits', async () => {
    const pi = new PiCalculator();
    const result = await pi.calculatePi('decimal', 1000);
    expect(result.length).toBe(1001);
  }, 60000);

  test('accurate to 1000 digits', async () => {
    const pi = new PiCalculator();
    const result = await pi.calculatePi('decimal', 1000);
    expect(collect(result)).toBe(PI_1000_DECIMAL);
  }, 60000);

  test('isCalculating is true during calculation', async () => {
    const pi = new PiCalculator();
    let seenCalculating = false;
    const promise = pi.calculatePi('decimal', 1000, {
      onArcTanDivisorCalculated: () => {
        if (pi.isCalculating) seenCalculating = true;
      },
    });
    await promise;
    expect(seenCalculating).toBe(true);
    expect(pi.isCalculating).toBe(false);
  }, 60000);

  test('supportedDigits are 1000/10000/50000', () => {
    const pi = new PiCalculator();
    expect([...pi.supportedDigits]).toEqual([1000, 10000, 50000]);
    expect([...SUPPORTED_DIGIT_COUNTS]).toEqual([1000, 10000, 50000]);
  });
});

describe('PiCalculator.calculatePi base12 (port of PiCalculatorFixture.CalculatePiAsBase12)', () => {
  test('pi string has 958 digits', async () => {
    const pi = new PiCalculator();
    const result = await pi.calculatePi('base12', 1000);
    expect(result.length).toBe(958);
  }, 60000);

  test('accurate to 1000 rounds (matches C# fixture)', async () => {
    const pi = new PiCalculator();
    const result = await pi.calculatePi('base12', 1000);
    expect(collect(result)).toBe(PI_1000_BASE12);
  }, 60000);

  test('reused calculator still works on a second run', async () => {
    const pi = new PiCalculator();
    const first = await pi.calculatePi('base12', 1000);
    const second = await pi.calculatePi('base12', 1000);
    expect(first.length).toBe(958);
    expect(second.length).toBe(958);
  }, 120000);

  test('cancel() resolves with the fallback digits instead of hanging', async () => {
    const pi = new PiCalculator();
    const promise = pi.calculatePi('decimal', 50000, {
      onArcTanDivisorCalculated: ({ divisor }) => {
        if (divisor >= 5) pi.cancel();
      },
    });
    const result = await promise;
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
    expect(pi.isCalculating).toBe(false);
  }, 60000);
});
