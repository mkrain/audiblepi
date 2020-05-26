using System;
using System.IO;

namespace Audible.Interfaces.Provider
{
    public class Note : IEquatable<Note>
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string Uri { get; set; }

        public Stream Stream { get; set; }

        public override string ToString()
        {
            return Name;
        }

        public override int GetHashCode()
        {
            var hashCode = string.IsNullOrEmpty(this.Name) ? 33 : this.Name.GetHashCode();

            return hashCode;
        }

        public bool Equals(Note other)
        {
            if( other == null )
                return false;
            if( string.IsNullOrEmpty(other.Name)|| string.IsNullOrEmpty(this.Name) )
                return false;
            if( other.Uri == null || this.Uri == null )
                return false;

            return this.GetHashCode() == other.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            return this.Equals(obj as Note);
        }
    }
}