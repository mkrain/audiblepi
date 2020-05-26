using System;
using System.Threading;

using Audible.Interfaces;
using Audible.Interfaces.Provider;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class BigNumberFixture
    {
        [TestFixture]
        public class GetPiDigitsBase10
        {
            [Test]
            public void ReturnsComputedPi()
            {
                const int rounds = 1000;

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds);

                leftNumber.ArcTan(16, 5);
                rightNumber.ArcTan(4, 239);

                leftNumber -= rightNumber;

                var computedPi = new ComputedPi();

                Assert.DoesNotThrow(() => computedPi = leftNumber.GetPiDigits());

                computedPi.Should().NotBeNull();
                computedPi.Count.Should().BeGreaterOrEqualTo(rounds);
            }

            [Test]
            public void EventIsCalledDuringCalculation()
            {
                const int rounds = 1000;
                var handle = new ManualResetEvent(false);

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds);

                leftNumber.CurrentDigitCalculatedEvent +=
                    (o, e) => handle.Set();

                leftNumber.ArcTan(16, 5);
                rightNumber.ArcTan(4, 239);

                ThreadPool.QueueUserWorkItem(
                    x =>
                    {
                        leftNumber -= rightNumber;
                        leftNumber.GetPiDigitsBase12();
                    });

                handle.WaitOne();
            }
        }

        [TestFixture]
        public class GetPiDigitsBase12
        {
            [Test]
            public void ReturnsComputedPi()
            {
                const int rounds = 1000;

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds);

                leftNumber.ArcTan(16, 5);
                rightNumber.ArcTan(4, 239);

                leftNumber -= rightNumber;

                var computedPi = new ComputedPi();

                Assert.DoesNotThrow(() => computedPi = leftNumber.GetPiDigitsBase12());

                computedPi.Should().NotBeNull();
                computedPi.Count.Should().BeLessOrEqualTo(rounds + 1);
            }

            [Test]
            public void EventIsCalledDuringCalculation()
            {
                const int rounds = 1000;
                var handle = new ManualResetEvent(false);

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds);

                leftNumber.CurrentDigitCalculatedEvent +=
                    (o, e) => handle.Set();

                leftNumber.ArcTan(16, 5);
                rightNumber.ArcTan(4, 239);

                ThreadPool.QueueUserWorkItem(
                    x =>
                    {
                        leftNumber -= rightNumber;
                        leftNumber.GetPiDigits();
                    });

                handle.WaitOne();
            }
        }

        [TestFixture]
        public class VerifySameSize
        {
            [Test]
            public void AreEqual()
            {
                const int rounds = 1000;

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds);

                Assert.DoesNotThrow(() => leftNumber.VerifySameSize(rightNumber));
            }

            [Test]
            public void ThrowsException()
            {
                const int rounds = 1000;

                var leftNumber = new Provider.BigNumber(rounds);
                var rightNumber = new Provider.BigNumber(rounds + 1);

                var exception = Assert.Throws<Exception>(() => leftNumber.VerifySameSize(rightNumber));

                exception.Message.Should().Contain(StringKey.ExceptionMessages.BigNumber.NumbersDifferentSizes);
            }
        }
    }
}