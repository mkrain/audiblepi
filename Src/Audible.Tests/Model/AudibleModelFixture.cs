using System;
using System.Linq;

using Audible.Interfaces.Provider;
using Audible.Model;
using Audible.Provider;

using FluentAssertions;

using Moq;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class AudibleModelFixture
    {
        [TestFixture]
        public class Constructor
        {
            [Test]
            public void ThrowsException()
            {
                Assert.Throws<ArgumentNullException>(
                    () => new NoteModel(null));
            }

            [Test]
            public void DoesNotThrowException()
            {
                Assert.DoesNotThrow( () => new NoteModel(new NoteProvider()));
            }
        }

        [TestFixture]
        public class Notes
        {
            [Test]
            public void IsNotNull()
            {
                var model = new NoteModel(new NoteProvider());

                model.Notes.Should().NotBeNull();
            }

            [Test]
            public void IsNotEmpty()
            {
                var model = new NoteModel(new NoteProvider());

                model.Notes.Should().NotBeEmpty();
            }

            [Test]
            public void HasAllNotes()
            {
                var model = new NoteModel(new NoteProvider());

                model.Notes.Should().HaveCount(12);
                model.Notes.ToList().ForEach(
                    n =>
                    {
                        n.Name.Should().NotBeNull();
                        n.Uri.Should().NotBeNull();
                        n.ToString().Should().BeEquivalentTo(n.Name);
                    });
            }
        }

        [TestFixture]
        public class BlankNote
        {
            [Test]
            public void IsNotNull()
            {
                var model = new NoteModel(new NoteProvider());

                model.Blank.Should().NotBeNull();
            }
        }

        [TestFixture]
        public class GetNoteFromName
        {
            [Test]
            public void ThrowsNullExceptionIfNull()
            {
                var model = new NoteModel(new NoteProvider());

                var expected = new NoteProvider().Blank;
                Note actual = null;

                Assert.DoesNotThrow(() => actual = model.GetNoteFromName(null));

                Assert.IsNotNull(actual);
                Assert.AreEqual(expected, actual);
            }

            [Test]
            public void ThrowsNullExceptionIfEmpty()
            {
                var model = new NoteModel(new NoteProvider());

                var expected = new NoteProvider().Blank;
                Note actual = null;

                Assert.DoesNotThrow(() => actual = model.GetNoteFromName(string.Empty));

                Assert.IsNotNull(actual);
                Assert.AreEqual(expected, actual);
            }

            [Test]
            public void ThrowsNullExceptionIfInvalidNoteName()
            {
                var model = new NoteModel(new NoteProvider());

                Assert.Throws<ArgumentException>(() => model.GetNoteFromName("E#"));
            }

            [Test]
            public void ReturnsCorrectNoteForName()
            {
                var model = new NoteModel(new NoteProvider());

                var notes = new [] { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "", "" };
                var base12 = new [] { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "", null };

                for (int i = 0; i < notes.Length; i++)
                {
                    var id = base12[i];
                    var note = model.GetNoteFromName(id);

                    Assert.AreEqual(notes[i], note.Name);                    
                }
            }
        }

        [TestFixture]
        public class SetNoteType
        {
            [Test]
            public void DoesNotThrow()
            {
                var noteProvider = new NoteProvider();

                var model = new NoteModel(noteProvider);

                Assert.DoesNotThrow(() => model.SetNoteType(It.IsAny<NoteType>()));
            }

            [Test]
            public void SetTypeIsCorrect()
            {
                var noteProvider = new NoteProvider();
                var model = new NoteModel(noteProvider);

                NoteType noteType = noteProvider.NoteTypes.FirstOrDefault(n => n.Name.Equals("Guitar"));

                model.SetNoteType(noteType);

                model.NoteType.Should().Be(noteType);
            }
        }
    }
}