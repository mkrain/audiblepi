
using System;

namespace Audible.Interfaces.Provider
{
    public class NoteType : IEquatable<NoteType>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImageUri { get; set; }

        #region Implementation of IEquatable<NoteType>

        public bool Equals(NoteType other)
        {
            if( ReferenceEquals(null, other) )
                return false;
            if( ReferenceEquals(this, other) )
                return true;
            var equals = other.Id == this.Id && Equals(other.Name, this.Name) && Equals(other.ImageUri, this.ImageUri);

            return equals;
        }

        #endregion

        public override bool Equals(object obj)
        {
            if( ReferenceEquals(null, obj) )
                return false;
            if( ReferenceEquals(this, obj) )
                return true;
            if( obj.GetType() != typeof( NoteType ) )
                return false;
            return Equals((NoteType)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                int result = this.Id;
                result = ( result * 397 ) ^ ( this.Name != null ? this.Name.GetHashCode() : 0 );
                result = ( result * 397 ) ^ ( this.ImageUri != null ? this.ImageUri.GetHashCode() : 0 );
                return result;
            }
        }
    }
}