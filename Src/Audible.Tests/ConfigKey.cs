
using Audible.Interfaces;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class ConfigKeyFixture
    {
        [Test]
        public void SelectedNoteType()
        {
            ConfigKey.SelectedNoteType.Should().BeEquivalentTo("SelectedNoteType");
        }

        [TestFixture]
        public class Update
        {
            [Test]
            public void CalculatingDigit()
            {
                ConfigKey.Update.CalculatingDigit.Should().BeEquivalentTo("Calculating");
            }

            [Test]
            public void CurrentDigit()
            {
                ConfigKey.Update.CurrentDigit.Should().BeEquivalentTo("CurrentDigit");
            }

            [Test]
            public void IsCalculating()
            {
                ConfigKey.Update.IsCalculating.Should().BeEquivalentTo("IsCalculating");
            }

            [Test]
            public void ContentVisiblity()
            {
                ConfigKey.Update.ContentVisiblity.Should().BeEquivalentTo("ContentVisiblity");
            }
        }

        [TestFixture]
        public class Ad
        {
            [Test]
            public void SmallAdProvider()
            {
                ConfigKey.Ad.SmallProvider.Should().BeEquivalentTo("SmallAdProvider");
            }

            [Test]
            public void LargeAdProvider()
            {
                ConfigKey.Ad.LargeProvider.Should().BeEquivalentTo("LargeAdProvider");
            }
        }
    }
}