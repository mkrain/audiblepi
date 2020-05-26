
using Audible.Interfaces.Provider;
using Audible.Model;


using Moq;

using NUnit.Framework;

namespace Audible.Tests.Model
{
    [TestFixture]
    public class PiModelFixtureBase
    {
        protected Mock<IPiCalculator> PiCalculator { get; private set; }
        protected Mock<IPiIterator<string>> PiIterator { get; private set; }
        protected Mock<IPiCalculatorFactory> PiCalculatorFactor { get; private set; }

        protected  PiModelFixtureBase()
        {
            this.PiCalculator = new Mock<IPiCalculator>();
            this.PiIterator = new Mock<IPiIterator<string>>();
            this.PiCalculatorFactor =new Mock<IPiCalculatorFactory>();

            this.PiCalculatorFactor
                .Setup(pc => pc.CalculatedPi)
                .Returns(this.PiCalculator.Object);
        }
    }

    [TestFixture]
    public class PiModelFixture
    {
        //[TestFixture]
        //public class Reset : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object);

        //        Assert.Throws<NotImplementedException>(piModel.Reset);
        //    }
        //}

        //[TestFixture]
        //public class MovePrevious : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => piModel.MovePrevious());
        //    }
        //}

        //[TestFixture]
        //public class MoveNext : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => piModel.MoveNext());
        //    }
        //}

        //[TestFixture]
        //public class Current : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => { var cur = piModel.Current; });
        //    }
        //}

        //[TestFixture]
        //public class Previous : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => { var cur = piModel.Previous; });
        //    }
        //}

        //[TestFixture]
        //public class Next : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => { var cur = piModel.Next; });
        //    }
        //}

        //[TestFixture]
        //public class SkipCount : PiModelFixtureBase
        //{
        //    [Test]
        //    public void GetsCount()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object);

        //        const int expected = 1000;

        //        PiIterator
        //            .SetupGet(pi => pi.SkipCount)
        //            .Returns(expected);

        //        piModel.SkipCount.Should().BeGreaterOrEqualTo(expected);

        //        PiIterator.VerifyGet(pi => pi.SkipCount, Times.Once());
        //    }

        //    [Test]
        //    public void SetsCount()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        PiIterator
        //            .SetupSet(pi => pi.SkipCount);

        //        Assert.DoesNotThrow(() => piModel.SkipCount = 999);


        //        PiIterator.VerifySet(pi => pi.SkipCount, Times.Once());
        //    }
        //}

        //[TestFixture]
        //public class Dispose : PiModelFixtureBase
        //{
        //    [Test]
        //    public void DoesNotThrow()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.DoesNotThrow(piModel.Dispose);

        //        PiIterator.Verify(pi => pi.Dispose(), Times.Once());
        //    }
        //}

        [TestFixture]
        public class Cancel : PiModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var piModel = new PiModel(PiCalculatorFactor.Object);

                Assert.DoesNotThrow(piModel.Cancel);

                PiCalculator.Verify(pi => pi.Cancel(), Times.Once());
            }
        }

        [TestFixture]
        public class SupportedDigits : PiModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var piModel = new PiModel(PiCalculatorFactor.Object);

                Assert.DoesNotThrow(() => { var sd = piModel.SupportedDigits; });

                PiCalculator.Verify(pi => pi.SupportedDigits, Times.Once());
            }
        }

        [TestFixture]
        public class CalculatePiAsDecimal : PiModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var piModel = new PiModel(PiCalculatorFactor.Object);

                Assert.DoesNotThrow(() => piModel.CalculatePiAsDecimal(It.IsAny<int>()));

                PiCalculator.Verify(pi => pi.CalculatePiAsDecimal(It.IsAny<int>()), Times.Once());
            }
        }

        [TestFixture]
        public class CalculatePiAsBase12 : PiModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var piModel = new PiModel(PiCalculatorFactor.Object);

                Assert.DoesNotThrow(() => piModel.CalculatePiAsBase12(It.IsAny<int>()));

                PiCalculator.Verify(pi => pi.CalculatePiAsBase12(It.IsAny<int>()), Times.Once());
            }
        }

        [TestFixture]
        public class IsCalculating : PiModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var piModel = new PiModel(PiCalculatorFactor.Object);

                Assert.DoesNotThrow(() => { var test = piModel.IsCalculating; });

                PiCalculator.Verify(pi => pi.IsCalculating, Times.Once());
            }
        }

        //[TestFixture]
        //public class GetEnumerator : PiModelFixtureBase
        //{
        //    [Test]
        //    public void ThrowsException()
        //    {
        //        var piModel = new PiModel(PiCalculator.Object, PiIterator.Object);

        //        Assert.Throws<NotImplementedException>(() => piModel.GetEnumerator());
        //    }
        //}

        [TestFixture]
        public class EventHandlers
        {
            [TestFixture]
            public class CurrentArcTanDivisorCalculatedEvent : PiModelFixtureBase
            {
                [Test]
                public void EventAdd()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( 
                        () =>
                        {
                            piModel.CurrentArcTanDivisorCalculatedEvent += (o, e) => { };
                        });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent += It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }

                [Test]
                public void EventRemove()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( () => { piModel.CurrentArcTanDivisorCalculatedEvent -= (o, e) => { }; });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent -= It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }
            }

            [TestFixture]
            public class CurrentDigitCalculatedEvent : PiModelFixtureBase
            {
                [Test]
                public void EventAdd()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( () => { piModel.CurrentDigitCalculatedEvent += (o, e) => { }; });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent += It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }

                [Test]
                public void EventRemove()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( () => { piModel.CurrentDigitCalculatedEvent -= (o, e) => { }; });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent -= It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }
            }

            [TestFixture]
            public class PiCalculatedEvent : PiModelFixtureBase
            {
                [Test]
                public void EventAdd()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( () => { piModel.PiCalculatedEvent += (o, e) => { }; });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent += It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }

                [Test]
                public void EventRemove()
                {
                    var piModel = new PiModel(PiCalculatorFactor.Object);

                    Assert.DoesNotThrow( () => { piModel.PiCalculatedEvent -= (o, e) => { }; });

                    //PiCalculator.Verify(pi => pi.CurrentArcTanDivisorCalculatedEvent -= It.IsAny<EventHandler<CalculatingArcTanEventArgs>>(), Times.Once());
                }
            }
        }
    }
}