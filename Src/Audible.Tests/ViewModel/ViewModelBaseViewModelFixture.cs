
using System.Collections.Generic;
using System.Linq;

using Audible.Interfaces;
using Audible.Interfaces.Provider;
using Audible.ViewModel;

using Moq;

using NUnit.Framework;

namespace Audible.Tests.ViewModel
{
    [TestFixture]
    public class ViewModelBaseViewModelFixture
    {
        [TestFixture]
        public class SelectedSkipDigit : ViewModelBaseFixture
        {
            [Test]
            public void SetNewValue()
            {
                const int skipDigits = 33333;

                this.Configuration
                    .Setup(cfg => cfg.Get<int>(ConfigKey.SelectedSkipDigit))
                    .Returns(12345);
                this.NoteProvider
                    .Setup(nt => nt.NoteTypes)
                    .Returns(
                        new List<NoteType>
                        {
                            new NoteType
                            {
                                Id = 0,
                                ImageUri = string.Empty,
                                Name = string.Empty
                            }
                        });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                model.SelectedSkipDigit = skipDigits;

                var actual = model.SelectedSkipDigit;

                this.Configuration.VerifySet(
                    cfg => cfg[ConfigKey.SelectedSkipDigit] = skipDigits);
                this.Configuration.Verify(
                    cfg => cfg.Get<int>(ConfigKey.SelectedSkipDigit), 
                    Times.AtLeast(2));
            }
        }

        [TestFixture]
        public class IsChecked : ViewModelBaseFixture
        {
             [Test]
            public void SetNewValue()
            {
                const bool isChecked = false;

                this.Configuration
                    .Setup(cfg => cfg.Get<bool>(ConfigKey.IsSoundLooped))
                    .Returns(true);
                 this.NoteProvider
                     .Setup(nt => nt.NoteTypes)
                     .Returns(
                         new List<NoteType>
                         {
                             new NoteType
                             {
                                 Id = 0,
                                 ImageUri = string.Empty,
                                 Name = string.Empty
                             }
                         });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                model.IsSoundLooped = isChecked;

                var actual = model.IsSoundLooped;

                this.Configuration.VerifySet(
                    cfg => cfg[ConfigKey.IsSoundLooped] = isChecked);
                this.Configuration.Verify(
                    cfg => cfg.Get<bool>(ConfigKey.IsSoundLooped), 
                    Times.AtLeast(2));
            }
        }

        //[TestFixture]
        //public class SelectedNumberOfDigits : ViewModelBaseFixture
        //{
        //     [Test]
        //    public void SetNewValue()
        //    {
        //        const int selectedDigits = 33333;

        //        this.Configuration
        //            .Setup(cfg => cfg.Get<int>(ConfigKey.SelectedNumberOfDigits))
        //            .Returns(12345);

        //        var model =
        //            new SettingsViewModel(
        //                this.PiModel.Object,
        //                this.IconProvider.Object,
        //                this.NoteModel.Object,
        //                this.Configuration.Object);

        //        model.SelectedNumberOfDigits = selectedDigits;

        //        var actual = model.SelectedNumberOfDigits;

        //        this.Configuration.VerifySet(
        //            cfg => cfg[ConfigKey.SelectedNumberOfDigits] = selectedDigits);
        //        this.Configuration.Verify(
        //            cfg => cfg.Get<int>(ConfigKey.SelectedNumberOfDigits), 
        //            Times.AtLeast(2));
        //    }
        //}

        [TestFixture]
        public class SelectedTempo : ViewModelBaseFixture
        {
            [Test]
            public void SetNewValue()
            {
                const int selectedNoteInterval = 33333;

                this.Configuration
                    .Setup(cfg => cfg.Get<int>(ConfigKey.SelectedNoteInterval))
                    .Returns(12345);
                this.NoteProvider
                    .Setup(nt => nt.NoteTypes)
                    .Returns(
                        new List<NoteType>
                        {
                            new NoteType
                            {
                                Id = 0,
                                ImageUri = string.Empty,
                                Name = string.Empty
                            }
                        });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                model.SelectedTempo = selectedNoteInterval;

                var actual = model.SelectedTempo;

                this.Configuration.VerifySet(
                    cfg => cfg[ConfigKey.SelectedNoteInterval] = selectedNoteInterval);
                this.Configuration.Verify(
                    cfg => cfg.Get<int>(ConfigKey.SelectedNoteInterval),
                    Times.AtLeast(2));
            }
        }

        [TestFixture]
        public class SkipDigits : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsValidCollection()
            {
                this.NoteProvider
                    .Setup(nt => nt.NoteTypes)
                    .Returns(
                        new List<NoteType>
                        {
                            new NoteType
                            {
                                Id = 0,
                                ImageUri = string.Empty,
                                Name = string.Empty
                            }
                        });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                var actual = model.SkipDigits;

                Assert.IsNotNull(actual);
                Assert.AreEqual(6, actual.Count());
            }
        }

        [TestFixture]
        public class SupportedDigits : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsValidCollection()
            {
                this.NoteProvider
                    .Setup(nt => nt.NoteTypes)
                    .Returns(
                        new List<NoteType>
                        {
                            new NoteType
                            {
                                Id = 0,
                                ImageUri = string.Empty,
                                Name = string.Empty
                            }
                        });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                var actual = model.SupportedDigits;

                Assert.IsNotNull(actual);
                Assert.AreEqual(4, actual.Count());
            }
        }

        [TestFixture]
        public class NotePlayInterval : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsValidCollection()
            {
                this.NoteProvider
                     .Setup(nt => nt.NoteTypes)
                     .Returns(
                         new List<NoteType>
                         {
                             new NoteType
                             {
                                 Id = 0,
                                 ImageUri = string.Empty,
                                 Name = string.Empty
                             }
                         });

                var model =
                    new SettingsViewModel(
                        this.PiModel.Object,
                        this.NoteProvider.Object,
                        this.Configuration.Object);

                var actual = model.NotePlayInterval;

                Assert.IsNotNull(actual);
                Assert.AreEqual(5, actual.Count());
            }
        }
    }
}