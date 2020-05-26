using System;

using Audible.Interfaces;
using Audible.ViewModel;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests.ViewModel
{
    [TestFixture]
    public class InfoViewModelFixture
    {
        [TestFixture]
        public class Constructor : ViewModelBaseFixture
        {
            [Test]
            public void DoesNotThrowException()
            {
                Assert.DoesNotThrow(() => new InfoViewModel(Configuration.Object));
            }

            [Test]
            public void ThrowsException()
            {
                Assert.Throws<ArgumentNullException>(() => new InfoViewModel(null));
            }
        }

        [TestFixture]
        public class PageName : ViewModelBaseFixture
        {
            [Test]
            public void ReturnsCorrectPageName()
            {
                var model = new InfoViewModel(Configuration.Object);

                var expected = StringKey.ViewModel.Info.PageName;
                var actual = model.PageName;

                actual.Should().BeEquivalentTo(expected);
            }

            [Test]
            public void ReturnsCorrectImageIconUri()
            {
                var model = new InfoViewModel(Configuration.Object);

                const string expected = "/Images/Info.png";
                var actual = model.ImageIconUri;

                actual.Should().BeEquivalentTo(expected);
            }
        }
    }
}