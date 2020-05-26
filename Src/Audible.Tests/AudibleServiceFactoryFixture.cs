using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;
using Audible.Interfaces.ViewModel;
using Audible.Service;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class AudibleServiceFactoryFixture
    {
        [TestFixture, Ignore]
        public class Constructor
        {
            [Test]
            public void DoesNotThrowException()
            {
                 Assert.DoesNotThrow( 
                    () =>
                    {
                        var f = Factory.Instance;
                    });
            }
        }

        [TestFixture, Ignore]
        public class GetInstance
        {
            [Test]
            public void GetNoteModelIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<INoteModel>().Should().NotBeNull();
            }

            [Test]
            public void GetNoteViewModelIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<INoteViewModel>().Should().NotBeNull();
            }

            [Test]
            public void GetPiCalculatorIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<IPiCalculator>().Should().NotBeNull();
            }

            [Test]
            public void GetPiViewModelIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<IPiViewModel>().Should().NotBeNull();
            }

            [Test]
            public void GetIconProviderIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<IIconProvider>().Should().NotBeNull();
            }

            [Test]
            public void GetSettingsViewModelIsNotNull()
            {
                var factory = Factory.Instance;

                Factory.Instance.GetInstance<ISettingsViewmodel>().Should().NotBeNull();
            }
        }
    }
}