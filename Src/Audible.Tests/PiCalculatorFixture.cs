using System.Linq;
using System.Threading;

using Audible.Provider;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class PiCalculatorFixture
    {
        [TestFixture]
        public class CalculatePiAsDecimal
        {
            [Test]
            public void IsNotNull()
            {
                var pi = new PiCalculator();

                pi.PiCalculatedEvent
                    += (o, s) => s.CalculatedPi.Should().NotBeNull();

                pi.CalculatePiAsDecimal(1000);
            }

            [Test]
            public void PiStringHasTheRightNumberOfDigits()
            {
                var pi = new PiCalculator();
                var waitHandle = new ManualResetEvent(false);

                pi.PiCalculatedEvent
                    += 
                    (o, s) =>
                    {
                        s.CalculatedPi.Length.Should().Be(1001);

                        waitHandle.Set();
                    };

                pi.CalculatePiAsDecimal(1000);

                waitHandle.WaitOne();
            }

            [Test]
            public void HasAccuratePiTo1KDigits()
            {
                const string pi1000Digits = "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

                var pi = new PiCalculator();
                var waitHandle = new ManualResetEvent(false);

                pi.PiCalculatedEvent +=
                    (o, s) =>
                    {
                        int index = 0;

                        while( index < pi1000Digits.Length )
                        {
                            var current = s.CalculatedPi.Current;

                            current.Should().Be(pi1000Digits[index].ToString());

                            index++;
                            s.CalculatedPi.MoveNext();
                        }

                        waitHandle.Set();
                    };

                pi.CalculatePiAsDecimal(1000);

                waitHandle.WaitOne();
            }

            [TestFixture]
            public class IsCalculating
            {
                [Test]
                public void ReturnsFalse()
                {
                    var pi = new PiCalculator();

                    Assert.IsFalse(pi.IsCalculating);
                }

                [Test]
                public void ReturnsTrue()
                {
                    var pi = new PiCalculator();
                    var waitHandle = new ManualResetEvent(false);

                    pi.CurrentArcTanDivisorCalculatedEvent +=
                        (o, s) =>
                        {
                            Assert.IsTrue(pi.IsCalculating);
                            waitHandle.Set();
                        };

                    pi.CalculatePiAsDecimal(1000);

                    waitHandle.WaitOne();
                }
            }

            [TestFixture]
            public class SupportingDigits
            {
                [Test]
                public void ReturnsValidDigits()
                {
                    var pi = new PiCalculator();

                    Assert.IsFalse(pi.IsCalculating);

                    var supportedDigits = pi.SupportedDigits.ToList();

                    Assert.AreEqual(1000, supportedDigits[0]);
                    Assert.AreEqual(10000, supportedDigits[1]);
                    Assert.AreEqual(50000, supportedDigits[2]);
                }
            }
        }

        [TestFixture]
        public class CalculatePiAsBase12
        {
            [Test]
            public void IsNotNull()
            {
                var pi = new PiCalculator();

                var waitHandle = new ManualResetEvent(false);

                pi.PiCalculatedEvent += 
                    (o, s) =>
                    {
                        s.CalculatedPi.Should().NotBeNull();

                        waitHandle.Set();
                    };

                pi.CalculatePiAsDecimal(1000);

                waitHandle.WaitOne();
            }

            [Test]
            public void PiStringHasTheRightNumberOfDigits()
            {
                var pi = new PiCalculator();

                pi.PiCalculatedEvent += 
                    (o, e) => e.CalculatedPi.Length.Should().Be(958);

                pi.CalculatePiAsBase12(1000);
            }

            [Test]
            public void LeftNumberAndRightNumberInitialized()
            {
                var pi = new PiCalculator();

                pi.PiCalculatedEvent += (o, e) => e.CalculatedPi.Length.Should().Be(958);

                pi.CalculatePiAsBase12(1000);
                pi.CalculatePiAsBase12(1000);
            }

            [Test]
            public void Canceled()
            {
                var pi = new PiCalculator();

                var waitHandle = new ManualResetEvent(false);

                pi.CurrentArcTanDivisorCalculatedEvent +=
                    (o, e) =>
                    {
                        if( e.Divisor >= 5 )
                            pi.Cancel();
                    };

                pi.PiCalculatedEvent += 
                    (o, s) =>
                    {
                        s.CalculatedPi.Should().NotBeNull();
                        waitHandle.Set();
                    };

                pi.CalculatePiAsDecimal(40000000);

                waitHandle.WaitOne();
            }

            [Test]
            public void HasAccuratePiTo1KDigits()
            {
                const string pi1000Digits = "3823B1343343B6911972133694023B2512820357341B31985A29829374542A33A39298377A1011741B20181A11796B34A9B3B658500B16BB33A1B55202281325332114B027022485423A133714640806347554138B32733137A15095279561A1302176864273265517B391458B3161B19AB74016513840B06B2250028984180372416A223603258279012B18615371BA7535B223466A37A32A055242BB101344787645678450AB1910439811443607A530A12430422BB88015232074659B93921716913790293B74526954022B4993B4B82B4A315B77A89843861193330391289BBAAB526618436AA39B314005746B1448AA836556216013253A419451AA323101412395B052107462B3273480531549B3414B71330AB410023B446384722B78483B0472223B28556390813535237A2A4773736745A41485B81B8051102717A2522B3129A6160B74549B33A794378320397473B7103A21086042003216992A74530541237415920260263589524B27499391529824AA73559A04093941652B250B02A4A7180AA4006A2073615A091743241263131A96A613511622139443267322A001166973B1502B8713846B2345B2A7551824814783231616863304674308B19B034630747516A9013A7309AAA334827635458433231347605106361199";

                var pi = new PiCalculator();

                pi.PiCalculatedEvent
                    += (o, s) =>
                    {
                        int index = 0;

                        while( index < pi1000Digits.Length )
                        {
                            var current = s.CalculatedPi.Current;

                            current.Should().Be(pi1000Digits[index].ToString());

                            index++;
                            s.CalculatedPi.MoveNext();
                        }
                    };

                pi.CalculatePiAsBase12(1000);
            }
        }
    }
}