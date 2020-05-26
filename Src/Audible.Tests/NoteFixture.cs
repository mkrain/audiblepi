

using System.Collections.Generic;

using Audible.Interfaces.Messages.Settings;
using Audible.Interfaces.Provider;

using FluentAssertions;

using NUnit.Framework;

namespace Audible.Tests
{
    [TestFixture]
    public class NoteFixture
    {
        [TestFixture]
        public class NoteEquals
        {
            [Test]
            public void ReturnsFalseForNullRhs()
            {
                Note note = new Note();

                note.Equals(null).Should().BeFalse();
            }

            [Test]
            public void ReturnsFalseForWhenRhsNameIsNullOrEmpty()
            {
                Note lhs = new Note { Name = "NotEmpty" };
                Note rhs = new Note();

                lhs.Equals(rhs).Should().BeFalse();
            }

            [Test]
            public void ReturnsFalseForWhenLhsNameIsNullOrEmpty()
            {
                Note lhs = new Note();
                Note rhs = new Note { Name = "NotEmpty"};

                lhs.Equals(rhs).Should().BeFalse();
            }

            [Test]
            public void ReturnsFalseForWhenRhsUriIsNullOrEmpty()
            {
                Note lhs = new Note { Uri = "http://dotnetperls.com/", Name = "NotEmpty" };
                Note rhs = new Note { Name = "NotEmpty"  };

                lhs.Equals(rhs).Should().BeFalse();
            }

            [Test]
            public void ReturnsFalseForWhenLhsUriIsNullOrEmpty()
            {
                Note lhs = new Note { Name = "NotEmpty" };
                Note rhs = new Note { Uri = "http://dotnetperls.com/", Name = "NotEmpty" };

                lhs.Equals(rhs).Should().BeFalse();
            }
        }

        [TestFixture]
        public class NoteTypeEquals
        {
            [TestFixture]
            public class ReferenceEquals
            {
                [Test]
                public void NullRhsReturnsFalse()
                {
                    var lhs = new NoteType();

                    lhs.Equals((object)null).Should().BeFalse();
                }    

                [Test]
                public void RhsDifferentTypeReturnsFalse()
                {
                    var lhs = new NoteType();

                    lhs.Equals(new List<string>()).Should().BeFalse();
                }

                [Test]
                public void RhsDifferentLhsReturnsTrue()
                {
                    var lhs = new NoteType();
                    object rhs = new NoteType();

                    lhs.Equals(rhs).Should().BeTrue();
                }
            }

            [TestFixture]
            public class Equals
            {
                [Test]
                public void NullRhsReturnsFalse()
                {
                    var lhs = new NoteType();
                    NoteType rhs = null;

                    lhs.Equals(rhs).Should().BeFalse();
                }

                [Test]
                public void LhsEqualsRhsReturnsTrue()
                {
                    var lhs = new NoteType();
                    NoteType rhs = lhs;

                    lhs.Equals(rhs).Should().BeTrue();
                }
            }
        }

        [TestFixture]
        public class NoteTypeGetHashCode
        {
            [Test]
            public void ReturnsValidHashCode()
            {
                var noteType = 
                    new NoteType
                    {
                        Id = 1, 
                        ImageUri = "ImageUrl", 
                        Name = "Name"
                    };

                int expected = noteType.Id;
                expected = ( expected * 397 ) ^ ( noteType.Name != null ? noteType.Name.GetHashCode() : 0 );
                expected = ( expected * 397 ) ^ ( noteType.ImageUri != null ? noteType.ImageUri.GetHashCode() : 0 );

                noteType.GetHashCode().Should().BeGreaterOrEqualTo(expected);
            }

            [Test]
            public void ReturnsValidHashCodeWithDefaultValues()
            {
                var noteType = new NoteType();

                int expected = noteType.Id;
                expected = ( expected * 397 ) ^ ( noteType.Name != null ? noteType.Name.GetHashCode() : 0 );
                expected = ( expected * 397 ) ^ ( noteType.ImageUri != null ? noteType.ImageUri.GetHashCode() : 0 );

                noteType.GetHashCode().Should().BeGreaterOrEqualTo(expected);
            }
        }

        
    }
}