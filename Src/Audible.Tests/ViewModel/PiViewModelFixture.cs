using System;
using System.Threading;

using Audible.Interfaces;
using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Model;
using Audible.Interfaces.Provider;
using Audible.ViewModel;

using Common.Configuration;

using FluentAssertions;

using GalaSoft.MvvmLight.Messaging;

using Moq;

using NUnit.Framework;

namespace Audible.Tests.ViewModel
{
    [TestFixture]
    public class PiViewModelFixture
    {
        [TestFixture]
        public class Constructor : ViewModelBaseFixture
        {
            [Test]
            public void DoesNotThrowException()
            {
                Assert.DoesNotThrow(
                    () => 
                        new PiViewModel(
                            this.PiModel.Object, 
                            this.IconProvider.Object, 
                            this.NoteModel.Object, 
                            this.Configuration.Object));
            }

            [Test]
            public void ThrowsExceptionWithNullPiModel()
            {
                Assert.Throws<ArgumentNullException>(
                    () => 
                        new PiViewModel(
                            null, 
                            this.IconProvider.Object, 
                            this.NoteModel.Object, 
                            this.Configuration.Object));
            }

            [Test]
            public void ThrowsExceptionWithNullIconProvider()
            {
                Assert.Throws<ArgumentNullException>(
                    () => 
                        new PiViewModel(
                            this.PiModel.Object, 
                            null, 
                            this.NoteModel.Object, 
                            this.Configuration.Object));
            }

            [Test]
            public void ThrowsExceptionWithNullNoteModel()
            {
                Assert.Throws<ArgumentNullException>(
                    () => 
                        new PiViewModel(
                            this.PiModel.Object, 
                            this.IconProvider.Object, 
                            null, 
                            this.Configuration.Object));
            }
        }

        [TestFixture]
        public class PreviousValue : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsBlankNoteWhenPiStringIsNull()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.PreviousValue.Should().Be(DefaultNote);
            }

            [Test]
            public void ReturnsEmptyWhenCurrentIndexIsZero()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.PiModel
                    .Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                model.PreviousValue.Should().Be(DefaultNote);
            }
        }

        [TestFixture]
        public class CurrentValue : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsBlankNoteWhenPiStringIsNull()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.CurrentValue.Should().Be(DefaultNote);
            }

            [Test]
            public void ReturnsEmptyWhenCurrentIndexIsZero()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.PiModel
                    .Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                model.CurrentValue.Should().Be(DefaultNote);
            }
        }

        [TestFixture]
        public class NextValue : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsBlankNoteWhenPiStringIsNull()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.NextValue.Should().Be(DefaultNote);
            }

            [Test]
            public void ReturnsEmptyWhenCurrentIndexIsZero()
            {
                this.NoteModel
                    .Setup(nm => nm.GetNoteFromName(It.IsAny<string>()))
                    .Returns(DefaultNote);

                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.PiModel
                    .Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                model.NextValue.Should().Be(DefaultNote);
            }
        }

        [TestFixture]
        public class PlayingCount : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsDefaultPlayingCountString()
            {
                var expected =
                    string.Format(
                        StringKey.FormatStrings.ViewModel.Pi.PlayingCount,
                        1, 0);
                
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.PlayingCount.Should().Be(expected);
            }

            [Test]
            public void ReturnsUpdatedPlayingCountString()
            {
                var expected =
                    string.Format(
                        StringKey.FormatStrings.ViewModel.Pi.PlayingCount,
                        1, 3);

                 var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.PiModel
                    .Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                model.PlayingCount.Should().Be(expected);
            }
        }

        [TestFixture]
        public class PlayIcon : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsPlayIconWhenIsPlayingIsFalse()
            {
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.IconProvider
                    .SetupGet(ip => ip.PlayIcon);

                model.PlayIcon.Should().BeNull();

                this.IconProvider.VerifyGet(ip => ip.PlayIcon, Times.Once());
            }

            [Test]
            public void ReturnsPauseIconWhenIsPlayingIsTrue()
            {
                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                this.IconProvider
                    .SetupGet(ip => ip.PauseIcon);

                model.IsPlaying = true;

                model.PlayIcon.Should().BeNull();

                this.IconProvider.VerifyGet(ip => ip.PauseIcon, Times.Once());
            }
        }

        [TestFixture]
        public class BusyIconUri : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsEmtyStringWhenIsCalculatingIsFalse()
            {
                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.IsCalculating = false;

                model.BusyIconUri.Should().BeEmpty();
            }

            [Test]
            public void ReturnsUriStringWhenIsCalculatingIsTrue()
            {
                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.IsCalculating = true;

                model.BusyIconUri.Should().Be("/Images/Busy.Icon.png");
            }
        }

        [TestFixture]
        public class MusicIconUri : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsEmtyStringWhenIsPlayingIsFalse()
            {
                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.IsPlaying = false;

                model.MusicIconUri.Should().BeEmpty();
            }

            [Test]
            public void ReturnsUriStringWhenIsPlayingIsTrue()
            {
                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.IsPlaying = true;

                model.MusicIconUri.Should().Be("/Images/Music.png");
            }
        }

        [TestFixture]
        public class ImageIconUri : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsImageIconUri()
            {
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.ImageIconUri.Should().Be("/Images/Music.png");
            }
        }

        [TestFixture]
        public class PageName : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsPageName()
            {
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.PageName.Should().Be(StringKey.ViewModel.Pi.PageName);
            }
        }

        [TestFixture]
        public class PiCalculated : ViewModelBaseFixture
        {
            [Test]
            public void SetsPreviousDigitSelectWhenCancelIsTrue()
            {
                  var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                model.Cancel = true;

                this.PiModel
                    .Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                //this.Configuration.VerifySet(cfg => cfg[ConfigKey.SelectedNumberOfDigits] = 0);
            }
        }

        [TestFixture]
        public class NoteIntervalChanged : ViewModelBaseFixture
        {
            [Test]
            public void NoteIntervalChangedIsCalled()
            {
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                Assert.DoesNotThrow(
                    () => Messenger.Default.Send(new NoteIntervalChangedMessage()));
            }
        }

        [TestFixture]
        public class PiDigitsChanged : ViewModelBaseFixture
        {
            [Test]
            public void PiDigitsChangedCalled()
            {
                var model =
                    new PiViewModel(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                Assert.DoesNotThrow(
                    () => Messenger.Default.Send(new PiPrecisionDigitSettingMessage()));
            }
        }

        [TestFixture]
        public class IsCheckedChanged : ViewModelBaseFixture
        {
            [Test]
            public void IsCheckedChangedIsCalledCurrentIndexIsZero()
            {
                var waitHandle = new ManualResetEvent(false);

                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                PiModel.Object.PiCalculatedEvent += 
                    (o, e) => waitHandle.Set();

                model.Cancel = false;

                this.PiModel.Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                waitHandle.WaitOne();

                Assert.DoesNotThrow(
                    () => Messenger.Default.Send(new IsSoundLoopedSettingMessage()));
            }

            [Test]
            public void IsCheckedChangedIsCalledCurrentGreaterThanPiStringCount()
            {
                var waitHandle = new ManualResetEvent(false);

                var model =
                    new PiViewModelHelper(
                        this.PiModel.Object,
                        this.IconProvider.Object,
                        this.NoteModel.Object,
                        this.Configuration.Object);

                PiModel.Object.PiCalculatedEvent += 
                    (o, e) => waitHandle.Set();

                model.Cancel = false;

                this.PiModel.Raise(pm => pm.PiCalculatedEvent += null, SmallPiCalculatedEvetArgs);

                model.CurrentIndex = 77;

                waitHandle.WaitOne();

                Assert.DoesNotThrow(
                    () => Messenger.Default.Send(new IsSoundLoopedSettingMessage()));
            }
        }
    }

    class PiViewModelHelper : PiViewModel
    {
        public bool IsPlaying
        {
            set { _isPlaying = value; }
        }

        public bool IsCalculating
        {
            set { _isCalculating = value; }
        }

        public new int CurrentIndex
        {
            set { base.CurrentIndex = value; }
        }

        public bool Cancel { set { _cancel = value; } }

        public PiViewModelHelper(
            IPiModel piModel, 
            IIconProvider iconProvider, 
            INoteModel model, 
            IPhoneConfiguration phoneConfiguration) : base(piModel, iconProvider, model, phoneConfiguration)
        {
        }
    }
}