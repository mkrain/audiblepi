using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace Audible.Interfaces.Provider
{
    public class ComputedPi : List<string>, IPiIterator<string>
    {
        private long _index;

        public ComputedPi()
        {
            var list = (from c in StringKey.Constants.Pi
                       where char.IsDigit(c)
                       select c);

            foreach( var c in list )
                base.Add(c.ToString(CultureInfo.InvariantCulture));

            _index = 0;
        }

        public ComputedPi(IEnumerable<char> pi)
        {
            var list = (from c in pi
                       where char.IsDigit(c)
                       select c);

            foreach( var c in list )
                base.Add(c.ToString(CultureInfo.InvariantCulture));

            _index = 0;
        }

        #region Implementation of IDisposable

        public void Dispose()
        {
            
        }
        
        #endregion

        #region Implementation of IEnumerator

        public bool MoveNext()
        {
            if( _index < this.Count - 1 )
            {
                _index++;
                return true;
            }

            return false;
        }

        public void Reset()
        {
            _index = 0;
        }

        public string Current
        {
            get
            {
                if( this.Count == 0 )
                    return string.Empty;
                return this[(int)_index];
            }
        }

        object IEnumerator.Current
        {
            get { return Current; }
        }

        #endregion

        #region Implementation of IPiIterator<string>

        public string Previous
        {
            get 
            { 
                if( this.Count == 0 )
                    return string.Empty;
                if( _index > 0 ) 
                    return this[(int)_index - 1];
                return string.Empty;
            }
        }

        public string Next
        {
            get
            {
                if( this.Count == 0 )
                    return string.Empty;
                if( _index < this.Count - 1 )
                    return this[(int)_index + 1];
                return string.Empty;
            }
        }

        public long Length
        {
            get
            {
                return this.Count;
            }
        }

        public bool MovePrevious()
        {
            if( _index > 0 )
            {
                _index--;
                return true;
            }

            return false;
        }

        public int ReadBytes(byte[] buffer, int offset, int count)
        {
            if( offset < 0 )
                throw new ArgumentException("offset is less than 0");
            if( offset > this.Count )
                throw new ArgumentException("offset is greater than the actual size");

            int index = 0;
            offset--;

            while( index < count )
            {
                var digit = this[offset + index++];

                buffer[index - 1] = Encoding.UTF8.GetBytes(digit)[0];
            }

            return count;
        }

        public long Seek(long offset, SeekOrigin origin)
        {
            switch( origin )
            {
                case SeekOrigin.Current:
                    if( ( _index + offset >= 0 ) && ( _index + offset < this.Count - 1 ) )
                        _index += offset;
                    else
                        _index = 0;
                    break;
                case SeekOrigin.End:
                    if( this.Count - offset < 0 )
                        _index = this.Count - 1;
                    else
                        _index = this.Count - offset;
                    break;
                case SeekOrigin.Begin:
                    if( offset < 0 )
                        _index = 0;
                    else if( offset > this.Count - 1 )
                        _index = this.Count - 1;
                    else
                        _index = offset;
                    break;
            }

            return _index;
        }

        #endregion
    }
}