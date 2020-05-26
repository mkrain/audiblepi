using Audible.Interfaces.Messages.PiCalculator;
using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Provider;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class MessageFixture
    {
        [TestFixture]
        public class SettingsFixture
        {
            [TestFixture]
            public class IsCheckedSettingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new IsSoundLoopedSettingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new IsSoundLoopedSettingMessage(false));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new IsSoundLoopedSettingMessage(false, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new IsSoundLoopedSettingMessage(false, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class NoteTypeChangedMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new NoteTypeChangedMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteTypeChangedMessage(new NoteType()));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteTypeChangedMessage(new NoteType(), this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteTypeChangedMessage(new NoteType(), this, "key"));
                    }
                }
            }

            [TestFixture]
            public class NoteIntervalChangedMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new NoteIntervalChangedMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteIntervalChangedMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteIntervalChangedMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new NoteIntervalChangedMessage(7, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class PiPrecisionDigitSettingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new PiPrecisionDigitSettingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new PiPrecisionDigitSettingMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new PiPrecisionDigitSettingMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new PiPrecisionDigitSettingMessage(7, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class PiSkipDigitSettingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new PiSkipDigitSettingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new PiSkipDigitSettingMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new PiSkipDigitSettingMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new PiSkipDigitSettingMessage(7, this, "key"));
                    }
                }
            }
        }

        [TestFixture]
        public class PiCalculatorFixture
        {
            [TestFixture]
            public class CalculatingArcTanMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new CalculatingArcTanMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingArcTanMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingArcTanMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingArcTanMessage(7, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class CalculatingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new CalculatingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new CalculatingMessage(7, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class CanceledMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new CanceledMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new CanceledMessage(false));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new CanceledMessage(false, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new CanceledMessage(false, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class StartingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new StartingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new StartingMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new StartingMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new StartingMessage(7, this, "key"));
                    }
                }
            }

            [TestFixture]
            public class StoppingMessageFixture
            {
                [TestFixture]
                public class Constructor
                {
                    [Test]
                    public void BaseConstructor()
                    {
                        Assert.DoesNotThrow(() => new StoppingMessage());
                    }

                    [Test]
                    public void BaseConstructorDataParameter()
                    {
                        Assert.DoesNotThrow(() => new StoppingMessage(7));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderParameter()
                    {
                        Assert.DoesNotThrow(() => new StoppingMessage(7, this));
                    }

                    [Test]
                    public void BaseConstructorDataAndSenderAndKeyParameter()
                    {
                        Assert.DoesNotThrow(() => new StoppingMessage(7, this, "key"));
                    }
                }
            }
        }
    }
}