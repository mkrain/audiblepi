
using Audible.Provider;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class StreamPiCalculatorFixture
    {
        [TestFixture]
        public class Constructor
        {
            [Test, Ignore]
            public void DoesNotThrow()
            {
                Assert.DoesNotThrow(() => new PiStreamIterator());
            }
        }
    }
}