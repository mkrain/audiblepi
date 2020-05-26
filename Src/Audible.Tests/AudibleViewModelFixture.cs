 using System;
 using System.Globalization;
 using System.Linq;

 using Audible.Interfaces.Model;
 using Audible.Model;
 using Audible.Provider;
 using Audible.ViewModel;

 using FluentAssertions;

 using Moq;

 using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class AudibleNoteViewModelFixture
    {
        [TestFixture]
        public class Constructor
        {
            [Test]
            public void ThrowsException()
            {
                Assert.Throws<ArgumentNullException>(
                    () => new NoteViewModel(null));
            }

            [Test]
            public void DoesNotThrowException()
            {
                var model = new Mock<INoteModel>();

                Assert.DoesNotThrow(
                    () => new NoteViewModel(model.Object));
            }
        }

        [TestFixture]
        public class Notes
        {
            [Test]
            public void IsNotNull()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                viewModel.Notes.Should().NotBeNull();
            }

            [Test]
            public void IsNotEmpty()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                viewModel.Notes.Should().NotBeNull();
            }

            [Test]
            public void HasAllNotes()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                viewModel.Notes.Should().HaveCount(12);
                viewModel.Notes.ToList().ForEach(
                    n =>
                    {
                        n.Name.Should().NotBeNull();
                        n.Uri.Should().NotBeNull();
                    });
            }

            [Test]
            public void IsOrdered()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                var previous = -1;

                viewModel.Notes.ToList().ForEach(
                    n =>
                    {
                        n.Id.Should().BeEquivalentTo((previous + 1).ToString(CultureInfo.InvariantCulture));

                        previous++;
                    });
            }
        }

        [TestFixture]
        public class SelectedNote
        {
            [Test]
            public void IsDefault()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                var first = viewModel.Notes.First(f => f.Name.Equals("A"));

                first.Equals(viewModel.SelectedNote).Should().BeTrue();
            }

            [Test]
            public void IsChanged()
            {
                var model = new NoteModel(new NoteProvider());
                var viewModel = new NoteViewModel(model);

                var first = viewModel.Notes.First();
                var expected = viewModel.Notes.Skip(5).First();

                viewModel.SelectedNote = expected;

                first.Equals(viewModel.SelectedNote).Should().BeFalse();
                expected.Equals(viewModel.SelectedNote).Should().BeTrue();
            }
        }
    }
}