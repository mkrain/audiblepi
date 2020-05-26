using System;
using System.Collections.Generic;

using Audible.Interfaces.Model;
using Audible.Model;
using Audible.Provider;
using Audible.ViewModel;

using Common.Configuration;

using Moq;

using NUnit.Framework;

using ConfigKey = Audible.Interfaces.ConfigKey;

namespace Audible.Tests
{
    public abstract class PiViewModelFixtureBase
    {
        protected PiCalculator PiCalculator { get; private set; }
        protected Mock<IPiModel> PiModel { get; private set; }
        protected IconProvider IconProvider { get; private set; }
        protected Mock<IPhoneConfiguration> PhoneConfiguration { get; private set; }
        protected NoteProvider NoteProvider { get; private set; }

        protected PiViewModelFixtureBase()
        {
            this.PiModel = new Mock<IPiModel>();
            this.PiCalculator = new PiCalculator();
            this.IconProvider = new IconProvider();
            this.NoteProvider = new NoteProvider();
            this.PhoneConfiguration = new Mock<IPhoneConfiguration>();

            this.PhoneConfiguration
                .Setup(cfg => cfg[ConfigKey.SelectedNoteInterval])
                .Returns(It.IsAny<int>());
            this.PhoneConfiguration
                .Setup(cfg => cfg[ConfigKey.SelectedNumberOfDigits])
                .Returns(It.IsAny<int>());
            this.PhoneConfiguration
                .Setup(cfg => cfg[ConfigKey.SelectedSkipDigit])
                .Returns(It.IsAny<int>());
            this.PhoneConfiguration
                .Setup(cfg => cfg[ConfigKey.IsSoundLooped])
                .Returns(It.IsAny<bool>());
            this.PiModel
                .Setup(pm => pm.SupportedDigits)
                .Returns(new List<int>{ 1, 10, 100, 50000 });
        }
    }

    [TestFixture]
    public class PiViewModelFixture
    {
        [TestFixture]
        public class Constructor : PiViewModelFixtureBase
        {
            [Test]
            public void DoesNotThrow()
            {
                var model = new NoteModel(NoteProvider);

                Assert.DoesNotThrow(() => new PiViewModel(PiModel.Object, IconProvider, model, PhoneConfiguration.Object));
            }

            [Test]
            public void ThrowsExceptionWhenPiCalculatorIsNull()
            {
                var model = new NoteModel(NoteProvider);

                Assert.Throws<ArgumentNullException>(
                    () => new PiViewModel(null, IconProvider, model, PhoneConfiguration.Object));
            }

            [Test]
            public void ThrowsExceptionWhenIconProviderIsNull()
            {
                var model = new NoteModel(NoteProvider);

                Assert.Throws<ArgumentNullException>(
                    () => new PiViewModel(PiModel.Object, null, model, PhoneConfiguration.Object));
            }

            [Test]
            public void ThrowsExceptionWhenPiModelIsNull()
            {
                Assert.Throws<ArgumentNullException>(
                    () => new PiViewModel(PiModel.Object, IconProvider, null, PhoneConfiguration.Object));
            }
        }
    }
}