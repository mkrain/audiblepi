using System;
using System.Globalization;
using System.IO;
using System.Text;

using Audible.Interfaces.Extensions;
using Audible.Provider;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class AudibleProviderFixture
    {
        [TestFixture]
        public class PianoNoteStreamNotNull
        {
            [Test]
            public void PianoNoteAHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteA.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteBHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteB.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteCHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteC.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteDHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteD.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteEHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteE.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteFHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteF.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteGHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteG.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteASharpHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteASharp.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteCSharpHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteCSharp.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteDSharpHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteDSharp.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteFSharpHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteFSharp.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteGSharpHasValidStream()
            {
                var provider = new NoteProvider();

                provider.PianoNoteGSharp.Should().NotBeNull();
            }
        }

        [TestFixture]
        public class PianoNoteNameNotNull
        {
            [Test]
            public void PianoNoteBlankHasValidName()
            {
                var provider = new NoteProvider();

                provider.Blank.Name.Should().BeNullOrEmpty();
            }

            [Test]
            public void PianoNoteAHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteA.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteBHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteB.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteCHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteC.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteDHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteD.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteEHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteE.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteFHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteF.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteGHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteG.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteASharpHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteASharp.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteCSharpHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteCSharp.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteDSharpHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteDSharp.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteFSharpHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteFSharp.Name.Should().NotBeNull();
            }

            [Test]
            public void PianoNoteGSharpHasValidName()
            {
                var provider = new NoteProvider();

                provider.PianoNoteGSharp.Name.Should().NotBeNull();
            } 
        }

        [TestFixture]
        public class IconProviderTest
        {
            [TestFixture]
            public class PlayIcon
            {
                [Test]
                public void IsNotNull()
                {
                    var provider = new IconProvider();

                    Assert.Throws<TypeInitializationException>(
                        () =>
                        {
                            var icon = provider.PlayIcon;
                        });
                }
            }

            [TestFixture]
            public class PauseIcon
            {
                [Test]
                public void IsNotNull()
                {
                    var provider = new IconProvider();

                    Assert.Throws<TypeInitializationException>(
                        () =>
                        {
                            var icon = provider.PauseIcon;
                        });
                }
            }
        }

        [TestFixture]
        public class PiCalculatorStreamIteratorTest
        {
            [TestFixture]
            public class Current
            {
                [Test]
                public void IsNotNull()
                {
                    PiStreamIterator piIterator = null;

                    Assert.DoesNotThrow(() => piIterator = new PiStreamIterator());
                    Assert.IsNotNull(piIterator);

                    var converted = "31415".ToBase12();

                    var current = piIterator.Current;

                    Assert.IsNotNull(current);
                    Assert.AreEqual(converted[0].ToString(), current);
                }
            }

            [TestFixture]
            public class Next
            {
                [Test]
                public void IsNotNull()
                {
                    PiStreamIterator piIterator = null;

                    Assert.DoesNotThrow(() => piIterator = new PiStreamIterator());
                    Assert.IsNotNull(piIterator);

                    var converted = "31415".ToBase12();

                    var current = piIterator.Current;
                    var next = piIterator.Next;

                    Assert.IsNotNull(next);
                    Assert.AreNotEqual(current, next);
                    Assert.AreEqual(converted[1].ToString(), next);
                }
            }

            [TestFixture]
            public class Previous
            {
                [Test]
                public void IsEmpty()
                {
                    PiStreamIterator piIterator = null;

                    Assert.DoesNotThrow(() => piIterator = new PiStreamIterator());
                    Assert.IsNotNull(piIterator);

                    var previous = piIterator.Previous;

                    Assert.IsEmpty(previous);
                }

                [Test]
                public void IsNotNullOrEmpty()
                {
                    PiStreamIterator piIterator = null;

                    Assert.DoesNotThrow(() => piIterator = new PiStreamIterator());
                    Assert.IsNotNull(piIterator);

                    var converted = "31415".ToBase12();

                    piIterator.MoveNext();
                    var previous = piIterator.Previous;

                    Assert.IsNotNullOrEmpty(previous);
                    Assert.AreEqual(converted[0].ToString(), previous);
                }
            }

            [TestFixture]
            public class MovePrevious
            {
                [Test]
                public void ReturnsFalse()
                {
                    var piIterator = new PiStreamIterator();

                    Assert.IsFalse(piIterator.MovePrevious());
                }

                [Test]
                public void ReturnsTrue()
                {
                    var piIterator = new PiStreamIterator();

                    int count = 0;

                    while( count++ < 900037 )
                        piIterator.MoveNext();

                    Assert.IsTrue(piIterator.MovePrevious());
                }
            }

            [TestFixture]
            public class MoveNext
            {
                [Test]
                public void ReturnsFalse()
                {
                    var piIterator = new PiStreamIterator();

                    int count = 0;

                    while( count++ < 1000000 )
                        piIterator.MoveNext();

                    Assert.IsFalse(piIterator.MoveNext());
                }

                [Test]
                public void ReturnsTrue()
                {
                    var piIterator = new PiStreamIterator();

                    Assert.IsTrue(piIterator.MoveNext());
                }
            }

            [TestFixture]
            public class Reset
            {
                [Test]
                public void IndexIsResetAfterMoveNext()
                {
                    var piIterator = new PiStreamIterator();

                    piIterator.MoveNext();

                    string current = piIterator.Current;

                    Assert.AreEqual("6", current);

                    piIterator.Reset();

                    current = piIterator.Current;

                    Assert.AreEqual("1", current);
                }
            }

            [TestFixture]
            public class Seek
            {
                //[Test]
                //public void Hack()
                //{
                //    var piIterator = new PiStreamIterator();

                //    piIterator.Seek(0, SeekOrigin.Begin);

                //    var buffer = new byte[5];

                //    using( var file = File.Open("D:\\1000000.txt", FileMode.CreateNew, FileAccess.Write) )
                //    {
                //        using( var writer = new StreamWriter(file) )
                //        {
                //            int count = 0;
                //            const int bufferSize = 5;

                //            //Write the 3 in decimal.
                //            piIterator.Seek(0, SeekOrigin.Begin);
                //            var read = piIterator.ReadBytes(buffer, 0, 1);
                //            var converted = Encoding.UTF8.GetString(buffer, 0, 1);
                //            writer.Write(converted);
                //            piIterator.Seek(1, SeekOrigin.Begin);

                //            while( count < piIterator.Length )
                //            {
                //                read = piIterator.ReadBytes(buffer, 0, bufferSize);

                //                converted = Encoding.UTF8.GetString(buffer, 0, bufferSize).ToBase12();

                //                writer.Write(converted);

                //                if( read < bufferSize )
                //                {
                //                    break;
                //                }

                //                count += read;

                //                piIterator.Seek(count, SeekOrigin.Begin);

                //            }

                //            writer.Write(Environment.NewLine);
                //        }
                //    }
                //}

                [Test]
                public void CanSeek()
                {
                    var piIterator = new PiStreamIterator();

                    piIterator.Seek(99, SeekOrigin.Begin);

                    string seekAt100 = "63A969782A158B435";

                    int index = 0;

                    while( index < seekAt100.Length )
                    {
                        Assert.AreEqual(
                            piIterator.Current, 
                            seekAt100[index].ToString(CultureInfo.InvariantCulture));

                        piIterator.MoveNext();
                        index++;
                    }
                }

                [Test]
                public void SeekingPastTheEndReadsTheEnd()
                {
                    var piIterator = new PiStreamIterator("10.txt");

                    var seekPosition = piIterator.Seek(100, SeekOrigin.Begin);

                    Assert.AreEqual(9, seekPosition);
                    Assert.AreEqual("3", piIterator.Current);
                    Assert.AreEqual("5", piIterator.Previous);
                    Assert.IsEmpty(piIterator.Next);
                }
            }

            [TestFixture]
            public class ReadBytes
            {
                [Test]
                public void CanReadBytes()
                {
                    var piIterator = new PiStreamIterator();

                    const string seekAt100 = "63A969782A158B435";

                    var read = new byte[seekAt100.Length];

                    piIterator.Seek(99, SeekOrigin.Begin);

                    piIterator.ReadBytes(read, 0, seekAt100.Length);

                    int index = 0;

                    while( index < seekAt100.Length )
                    {
                        var readString = Encoding.UTF8.GetString(read, index, 1);
                        var expectedString = seekAt100[index].ToString(CultureInfo.InvariantCulture);

                        Assert.AreEqual(readString, expectedString);

                        index++;
                    }
                }
            }

            [TestFixture]
            public class Length
            {
                [Test]
                public void ReturnsCorrectLength()
                {
                    var piIterator = new PiStreamIterator();

                    const long expectedLength = 955187;

                    Assert.AreEqual(expectedLength, piIterator.Length);
                }
            }
        }
    }
}