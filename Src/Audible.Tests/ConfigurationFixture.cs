

using FluentAssertions;

using NUnit.Framework;

using ConfigKey = Audible.Interfaces.ConfigKey;

namespace Audible.Tests
{
    [TestFixture]
    public class ConfigurationFixture
    {
        [TestFixture]
        public class ConfigKeyTest
        {
            [Test]
            public void SelectedNumberOfDigitsIsValid()
            {
                const string expected = "SelectedNumberOfDigits";
                var actual = Interfaces.ConfigKey.SelectedNumberOfDigits;

                actual.Should().BeEquivalentTo(expected);
            }

            [Test]
            public void SelectedSkipDigitIsValid()
            {
                const string expected = "SelectedSkipDigit";
                var actual = Interfaces.ConfigKey.SelectedSkipDigit;

                actual.Should().BeEquivalentTo(expected);
            }

            [Test]
            public void InvalidIsValid()
            {
                const string expected = "Invalid";
                var actual = Interfaces.ConfigKey.Invalid;

                actual.Should().BeEquivalentTo(expected);
            }
        }

        [TestFixture]
        public class ViewModel
        {
            [Test]
            public void PiViewIsValid()
            {
                const string expected = "Pi";
                var actual = ConfigKey.ViewModel.PiView;

                actual.Should().BeEquivalentTo(expected);
            }

            [Test]
            public void SettingsViewIsValid()
            {
                const string expected = "Settings";
                var actual = Interfaces.ConfigKey.ViewModel.Settings;

                actual.Should().BeEquivalentTo(expected);
            }

            [Test]
            public void NoteViewValid()
            {
                const string expected = "Note";
                var actual = Interfaces.ConfigKey.ViewModel.Note;

                actual.Should().BeEquivalentTo(expected);
            }
        }
    }
}