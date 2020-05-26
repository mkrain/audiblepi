using System;

using Audible.Interfaces;
using Audible.Provider.Ads;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class AdProviderFixture
    {
        [TestFixture]
        public class SmallAdProviderFixture
        {
            [TestFixture]
            public class Constructor
            {
                [Test]
                public void DoesNotThrow()
                {
                    const string adId = "ABCDEDFGHI";
                    const string appId = "APPID";

                    Assert.DoesNotThrow(() => new SmallAdProvider(adId, appId));   
                }
            }
        }

        [TestFixture]
        public class LargeAdProviderFixture
        {
            [TestFixture]
            public class Constructor
            {
                [Test]
                public void DoesNotThrow()
                {
                    const string adId = "ABCDEDFGHI";
                    const string appId = "APPID";

                    Assert.DoesNotThrow(() => new LargeAdProvider(adId, appId));
                }
            }
        }

        [TestFixture]
        public class ThrowsException
        {
            [Test]
            public void WithEmptyAdId()
            {
                const string appId = "APPID";

                var exception = Assert.Throws<ArgumentNullException>(
                    () => new LargeAdProvider(string.Empty, appId));

                exception.Message.Should().Contain("adUnitId");
            }

            [Test]
            public void WithEmptyAppId()
            {
                const string adId = "ABCDEDFGHI";

                var exception = Assert.Throws<ArgumentNullException>(
                    () => new LargeAdProvider(adId, string.Empty));

                exception.Message.Should().Contain("applicationId");
            }
                                        
            [Test]
            public void WithHeightLessThanZero()
            {
                const string adId = "ABCDEDFGHI";
                const string appId = "APPID";

                var exception = Assert.Throws<ArgumentException>(
                    () => new LargeAdProvider(adId, appId, -1, 100));

                exception.Message.Should().Contain(StringKey.ExceptionMessages.AdProvider.NegativeHeight);
            }

            [Test]
            public void WithHeightEqualZero()
            {
                const string adId = "ABCDEDFGHI";
                const string appId = "APPID";

                var exception = Assert.Throws<ArgumentException>(
                    () => new LargeAdProvider(adId, appId, 0, 100));

                exception.Message.Should().Contain(StringKey.ExceptionMessages.AdProvider.NegativeHeight);
            }

            [Test]
            public void WithWidthLessThanZero()
            {
                const string adId = "ABCDEDFGHI";
                const string appId = "APPID";

                var exception = Assert.Throws<ArgumentException>(
                    () => new LargeAdProvider(adId, appId, 100, -1));

                exception.Message.Should().Contain(StringKey.ExceptionMessages.AdProvider.NegativeWidth);
            }

            [Test]
            public void WithWitdhEqualZero()
            {
                const string adId = "ABCDEDFGHI";
                const string appId = "APPID";

                var exception = Assert.Throws<ArgumentException>(
                    () => new LargeAdProvider(adId, appId, 100, 0));

                exception.Message.Should().Contain(StringKey.ExceptionMessages.AdProvider.NegativeWidth);
            }
        }
    }
}