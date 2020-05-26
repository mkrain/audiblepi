using System;
using System.Linq;

using Audible.Interfaces;
using Audible.Interfaces.Provider;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class ComputedPiFixture
    {
        [TestFixture]
        public class Constructor
        {
            [Test]
            public void DoesNotThrowDefault()
            {
                Assert.DoesNotThrow(() => new ComputedPi());
            }

            [Test]
            public void DoesNotThrowOverload()
            {
                Assert.DoesNotThrow(() => new ComputedPi("1234567".ToCharArray()));
            }

            [Test]
            public void ThrowsExceptionWhenPiDigitsIsNull()
            {
               Assert.Throws<ArgumentNullException>(
                    () => new ComputedPi(null)); 
            }
        }

        [TestFixture]
        public class PiDigits
        {
            [Test]
            public void DefaultPiString()
            {
                var computedPi = new ComputedPi();

                //computedPi.PiDigits.Should().NotBeNull();
                computedPi.Count.Should().BeGreaterOrEqualTo(6);
            }

            [Test]
            public void NonDefaultPiString()
            {
                var computedPi = new ComputedPi("1234567".ToCharArray());

                //computedPi.PiDigits.Should().NotBeNull();
                computedPi.Count.Should().BeGreaterOrEqualTo(6);
            }
        }

        [TestFixture]
        public class Item
        {
            [Test]
            public void ReturnsDefaultIndexedItem()
            {
                var computedPi = new ComputedPi();

                var pi = from c in StringKey.Constants.Pi
                         where c != '.'
                         select c.ToString();

                int index = 0;

                foreach (var digit in pi)
                {
                    computedPi[index++].Should().Be(digit);
                }
            }

            [Test]
            public void ReturnsNonDefaultIndexedItem()
            {
                var pi = "3111212343543554326246244256542".ToCharArray();

                var computedPi = new ComputedPi(pi);

                int index = 0;

                foreach (var digit in pi)
                {
                    computedPi[index++].Should().Be(digit.ToString());
                }
            }

            [Test]
            public void ReturnsValidItemWhenIndexGreaterThanSize()
            {
                var pi = "3111212343543554326246244256542".ToCharArray();

                var computedPi = new ComputedPi(pi);

                Assert.Throws<ArgumentOutOfRangeException>(
                    () => { var c = computedPi[pi.Length + 2]; } );
            }

            [Test]
            public void ReturnsValidItemWhenIndexLessThanZero()
            {
                var pi = "3111212343543554326246244256542".ToCharArray();

                var computedPi = new ComputedPi(pi);

                Assert.Throws<ArgumentOutOfRangeException>(
                    () => { var c = computedPi[-1]; } );
            }
        }
    }
}
